suppressPackageStartupMessages({
  library(sf)
  library(dplyr)
  library(readr)
  library(jsonlite)
})

`%||%` <- function(a, b) {
  if (is.null(a)) b else a
}

script_path <- sub("--file=", "", grep("^--file=", commandArgs(FALSE), value = TRUE)[1] %||% ".")
root <- normalizePath(file.path(dirname(script_path), ".."), mustWork = TRUE)
output_dir <- file.path(root, "r_outputs")
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

datasets <- list(
  all_candidate_sites = file.path(root, "All_Candidate_Sites", "All_Candidate_Sites_Final.shp"),
  facility_scored = file.path(root, "Facility_Scored", "solar_potential_scored_indotfacility.shp"),
  row_scored = file.path(root, "ROW_Scored", "solar_potential_scored_interchange.shp")
)

land_cover_fields <- c(
  "DevOpe_21", "DevLowI_22", "DDevMed_23", "DDevHig_24", "DecFor_41",
  "GrasHe_71", "OpenW_11", "EverFor_42", "MixFor_43", "SShrub_52",
  "PasHay_81", "CultCr_82", "welan_90", "EmerW_95", "Barre_31"
)

score_fields <- c("sol_s", "slp_s", "trn_s", "evp_s", "dem_s", "fld_s", "lc_s")

markdown_escape <- function(x) {
  x <- gsub("\\|", "\\\\|", x)
  x <- gsub("\r?\n", " ", x)
  x
}

relative_path <- function(path) {
  normalized_path <- gsub("\\\\", "/", normalizePath(path, mustWork = FALSE))
  normalized_root <- gsub("\\\\", "/", root)
  sub(paste0("^", normalized_root, "/?"), "", normalized_path)
}

first_examples <- function(x, n = 3) {
  values <- x[!is.na(x)]
  if (length(values) == 0) {
    return("")
  }
  markdown_escape(paste(head(as.character(values), n), collapse = "; "))
}

field_type <- function(x) {
  paste(class(x), collapse = "/")
}

derive_lon_lat <- function(gdf) {
  # Use a point guaranteed to lie on/in the polygon in the source projected CRS,
  # then transform that point to WGS84 for browser-map longitude/latitude.
  points <- st_point_on_surface(st_geometry(gdf))
  points_4326 <- st_transform(st_as_sf(data.frame(row_id = seq_along(points)), geometry = points, crs = st_crs(gdf)), 4326)
  coords <- st_coordinates(points_4326)
  tibble(derived_longitude = coords[, "X"], derived_latitude = coords[, "Y"])
}

summarize_dataset <- function(name, path) {
  if (!file.exists(path)) {
    return(list(
      markdown = c(paste0("## ", name), "", paste0("Missing file: `", path, "`"), ""),
      summary = tibble(dataset = name, source = path, records = NA_integer_, crs = NA_character_, valid_geometries = NA_integer_, invalid_geometries = NA_integer_),
      issues = tibble(dataset = name, issue = "missing_file", detail = path)
    ))
  }

  gdf <- st_read(path, quiet = TRUE)
  crs_text <- st_crs(gdf)$input %||% as.character(st_crs(gdf)$epsg)
  geom_types <- paste(sort(unique(as.character(st_geometry_type(gdf)))), collapse = ", ")
  bounds <- st_bbox(gdf)
  validity <- st_is_valid(gdf)
  validity_reason <- st_is_valid(gdf, reason = TRUE)
  lon_lat <- derive_lon_lat(gdf)

  attrs <- st_drop_geometry(gdf) %>%
    bind_cols(lon_lat)

  csv_path <- file.path(output_dir, paste0(name, "_attributes_with_derived_latlong.csv"))
  write_csv(attrs, csv_path)

  raw_lat_unique <- if ("Lat" %in% names(attrs)) sort(unique(attrs$Lat)) else NA
  raw_long_unique <- if ("Long" %in% names(attrs)) sort(unique(attrs$Long)) else NA

  field_lines <- c(
    "### Fields",
    "",
    "| Field | Type | Non-null | Example |",
    "|-------|------|----------|---------|"
  )
  for (column in names(attrs)) {
    values <- attrs[[column]]
    field_lines <- c(field_lines, sprintf(
      "| `%s` | `%s` | %s | %s |",
      column,
      field_type(values),
      format(sum(!is.na(values)), big.mark = ","),
      first_examples(values)
    ))
  }

  issue_rows <- list()
  if ("Lat" %in% names(attrs) && length(raw_lat_unique) == 1 && identical(as.numeric(raw_lat_unique), 0)) {
    issue_rows <- append(issue_rows, list(tibble(dataset = name, issue = "raw_lat_zero", detail = "Raw Lat field contains only 0 values.")))
  }
  if ("Long" %in% names(attrs) && length(raw_long_unique) == 1 && identical(as.numeric(raw_long_unique), 0)) {
    issue_rows <- append(issue_rows, list(tibble(dataset = name, issue = "raw_long_zero", detail = "Raw Long field contains only 0 values.")))
  }
  if (any(!validity)) {
    invalid_details <- attrs[!validity, intersect(c("SPR_ID", "Site_typ", "Unit_Site"), names(attrs)), drop = FALSE]
    invalid_text <- paste(capture.output(print(invalid_details)), collapse = " ")
    reason_text <- paste(unique(validity_reason[!validity]), collapse = "; ")
    issue_rows <- append(issue_rows, list(tibble(dataset = name, issue = "invalid_geometry", detail = paste(reason_text, invalid_text))))
  }

  lc_present <- intersect(land_cover_fields, names(attrs))
  if (length(lc_present) > 0) {
    lc_sums <- rowSums(attrs[, lc_present, drop = FALSE], na.rm = TRUE)
    median_sum <- median(lc_sums, na.rm = TRUE)
    issue_rows <- append(issue_rows, list(tibble(dataset = name, issue = "land_cover_sum_median", detail = sprintf("Median land-cover sum: %.6f", median_sum))))
  }

  for (field in intersect(score_fields, names(attrs))) {
    if (length(unique(attrs[[field]])) == 1) {
      issue_rows <- append(issue_rows, list(tibble(dataset = name, issue = "constant_score_field", detail = sprintf("%s is constant at %s", field, unique(attrs[[field]])[1]))))
    }
  }

  issues <- if (length(issue_rows) > 0) bind_rows(issue_rows) else tibble(dataset = character(), issue = character(), detail = character())

  markdown <- c(
    paste0("## ", name),
    "",
    paste0("- Source: `", relative_path(path), "`"),
    paste0("- Records: ", format(nrow(gdf), big.mark = ",")),
    paste0("- CRS: `", crs_text, "`"),
    paste0("- Geometry types: ", geom_types),
    paste0("- Bounds: [", paste(as.numeric(bounds), collapse = ", "), "]"),
    paste0("- Valid geometries: ", sum(validity), " / ", length(validity)),
    paste0("- Raw Lat unique values: ", paste(head(raw_lat_unique, 10), collapse = ", ")),
    paste0("- Raw Long unique values: ", paste(head(raw_long_unique, 10), collapse = ", ")),
    paste0("- Derived latitude range: ", sprintf("%.6f to %.6f", min(lon_lat$derived_latitude), max(lon_lat$derived_latitude))),
    paste0("- Derived longitude range: ", sprintf("%.6f to %.6f", min(lon_lat$derived_longitude), max(lon_lat$derived_longitude))),
    paste0("- Attribute CSV: `", relative_path(csv_path), "`"),
    "",
    field_lines,
    ""
  )

  summary <- tibble(
    dataset = name,
    source = normalizePath(path),
    records = nrow(gdf),
    crs = crs_text,
    geometry_types = geom_types,
    valid_geometries = sum(validity),
    invalid_geometries = sum(!validity),
    raw_lat_unique_count = if ("Lat" %in% names(attrs)) length(raw_lat_unique) else NA_integer_,
    raw_long_unique_count = if ("Long" %in% names(attrs)) length(raw_long_unique) else NA_integer_,
    derived_lat_min = min(lon_lat$derived_latitude),
    derived_lat_max = max(lon_lat$derived_latitude),
    derived_long_min = min(lon_lat$derived_longitude),
    derived_long_max = max(lon_lat$derived_longitude),
    output_csv = normalizePath(csv_path)
  )

  list(markdown = markdown, summary = summary, issues = issues, data = attrs)
}

results <- lapply(names(datasets), function(name) summarize_dataset(name, datasets[[name]]))
names(results) <- names(datasets)

inventory_md <- c(
  "# R Data Inventory",
  "",
  "This report was generated using R and `sf`. It recreates the Python inventory workflow and adds derived longitude/latitude from the polygon geometries.",
  "",
  unlist(lapply(results, `[[`, "markdown"))
)
writeLines(inventory_md, file.path(output_dir, "data_inventory_r.md"), useBytes = TRUE)

summary_table <- bind_rows(lapply(results, `[[`, "summary"))
issues_table <- bind_rows(lapply(results, `[[`, "issues"))
write_csv(summary_table, file.path(output_dir, "dataset_summary_r.csv"))
write_csv(issues_table, file.path(output_dir, "data_issues_r.csv"))
write_json(summary_table, file.path(output_dir, "dataset_summary_r.json"), pretty = TRUE, auto_unbox = TRUE)

if (all(c("all_candidate_sites", "facility_scored", "row_scored") %in% names(results))) {
  all_ids <- as.integer(results$all_candidate_sites$data$SPR_ID)
  facility_ids <- as.integer(results$facility_scored$data$SPR_ID)
  row_ids <- as.integer(results$row_scored$data$SPR_ID)
  scored_ids <- union(facility_ids, row_ids)
  id_report <- tibble(
    metric = c("all_candidate_sites", "facility_scored", "row_scored", "scored_union", "missing_from_scored", "facility_row_overlap"),
    value = c(length(unique(all_ids)), length(unique(facility_ids)), length(unique(row_ids)), length(unique(scored_ids)), length(setdiff(all_ids, scored_ids)), length(intersect(facility_ids, row_ids))),
    details = c(
      "",
      "",
      "",
      "",
      paste(setdiff(all_ids, scored_ids), collapse = ", "),
      paste(intersect(facility_ids, row_ids), collapse = ", ")
    )
  )
  write_csv(id_report, file.path(output_dir, "id_comparison_r.csv"))
}

cat("Wrote R outputs to:", output_dir, "\n")
