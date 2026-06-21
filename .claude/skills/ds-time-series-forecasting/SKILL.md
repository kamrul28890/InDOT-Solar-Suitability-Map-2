---
name: ds-time-series-forecasting
description: Curated prompts for time series analysis and forecasting — decomposition, stationarity, model selection, forecast evaluation. Use when analyzing or forecasting time-ordered data.
---

# Time Series Forecasting — Prompt Library (Data Scientist)

Time series work in 2026 spans a spectrum from a classical STL decomposition and ARIMA model on a single clean series to gradient-boosted trees with lag features or a Temporal Fusion Transformer forecasting thousands of related series at once with hierarchical reconciliation — and picking the wrong point on that spectrum is one of the most common ways forecasting projects waste time. Good work here starts with actually looking at the series: decomposing trend, seasonality, and residual (STL), testing for stationarity (Augmented Dickey-Fuller) before fitting anything like ARIMA, and checking for multiple seasonality or holiday effects that a naive model will miss. It means choosing classical (SARIMA, ETS), modern statistical (Prophet), or ML/deep learning (lagged-feature GBMs, N-BEATS, Temporal Fusion Transformer) based on data volume, number of series, and need for covariates — not on what's trendy. It means evaluating forecasts with the right metric (MAPE and sMAPE for point forecasts, pinball loss for quantile forecasts) using a backtesting strategy that respects time order (rolling-origin cross-validation, never a random shuffle), and being explicit about prediction intervals rather than reporting a single number as if the future were certain. AI assistants now help draft decomposition and backtesting code and explain model trade-offs quickly, but diagnosing whether a series is actually stationary, whether seasonality is additive or multiplicative, and whether a forecast error is a model problem or a real regime change still takes an analyst who's looked at the data.

## How to use this library

> Copy a prompt below, fill in the `[bracketed]` specifics for your actual situation, and paste it to your AI assistant. Start in the section that matches where you are on the problem, and use the follow-up prompts to go deeper once you have a first answer. The anti-pattern pairs at the bottom show the difference a sharper, more specific prompt makes.

## Foundational prompts (understand & explore)

1. I have a time series of `[describe, e.g., "daily sales over 3 years"]` — walk me through how to do an STL decomposition to separate trend, seasonality, and residual, and what I should look for in each component before choosing a forecasting model.
2. Explain how to run and interpret an Augmented Dickey-Fuller test for stationarity on my series — what does a failure to reject the null mean practically, and what differencing or transformation would I apply in response?
3. Compare ARIMA, SARIMA, and exponential smoothing (ETS) for `[describe series, e.g., "a series with weekly seasonality and a clear upward trend"]` — what does each model assume, and which assumption is most likely to be violated by my data?
4. I'm deciding between Prophet, a gradient-boosted tree model with lag/rolling features, and a deep learning approach like N-BEATS or a Temporal Fusion Transformer for `[describe use case, e.g., "forecasting demand for 500 SKUs with promotional calendars as covariates"]` — what data volume and covariate complexity would justify each choice?
5. My data has multiple seasonality — `[describe, e.g., "daily, weekly, and yearly patterns"]` — explain how classical SARIMA struggles here and what alternatives (TBATS, Prophet with multiple seasonality terms, or a deep learning approach) handle this better.
6. Walk me through the difference between MAPE, sMAPE, and pinball loss as forecast evaluation metrics, and tell me which is appropriate given that my series has `[describe, e.g., "values close to zero" or "I need quantile forecasts for inventory planning"]`.
7. Explain rolling-origin (walk-forward) cross-validation for time series and why a standard random k-fold split would give me an overly optimistic and invalid estimate of forecast accuracy for `[my series]`.
8. I need to forecast at multiple levels of a hierarchy — `[describe, e.g., "total company revenue, by region, by store"]` — explain what hierarchical forecasting reconciliation methods (top-down, bottom-up, MinT) do and why naively forecasting each level independently causes inconsistency.
9. How should I think about holiday effects in my forecast for `[describe series and region/country]` — what's the right way to encode holidays as regressors versus treating them as anomalies to be smoothed over?
10. Help me scope a forecasting problem: stakeholders want to forecast `[metric]` `[horizon, e.g., "12 weeks out"]` — what historical data length, granularity, and covariates would I need before committing to a model approach?

## Implementation prompts (build & debug)

1. Write Python code to perform an STL decomposition on my series using `statsmodels`, plot the components, and flag whether the seasonality looks additive or multiplicative based on the residual pattern.
2. Write code to run an Augmented Dickey-Fuller test and a KPSS test together on my series, and interpret the case where they disagree about stationarity.
3. Build a SARIMA model for `[describe series]` including code to use `auto_arima` (pmdarima) for order selection, followed by residual diagnostics (Ljung-Box test, residual ACF) to confirm the model adequately captures autocorrelation.
4. Write code to fit a Prophet model on `[describe series]` with custom holiday regressors for `[country/region]` and multiplicative seasonality, and extract the components plot to sanity-check trend changepoints.
5. Build a lag-feature dataset (lags, rolling means, rolling std) from my raw time series for use with a `[LightGBM/XGBoost]` model, and write the rolling-origin cross-validation loop to evaluate it without leaking future information into past folds.
6. My SARIMA model's residuals show significant autocorrelation at lag `[N]` in the Ljung-Box test — help me debug whether this means I need a higher-order seasonal term, a missing exogenous regressor, or a fundamentally different model.
7. Write code to generate quantile forecasts (e.g., 10th, 50th, 90th percentile) using `[LightGBM with quantile loss / a quantile regression approach]` and evaluate them with pinball loss against my held-out backtest period.
8. Implement rolling-origin cross-validation for comparing `[model A]` versus `[model B]` on `[N]` historical forecast origins, reporting MAPE and sMAPE at each horizon step from 1 to `[H]`.
9. Debug why my Prophet/SARIMA forecast for `[series]` is badly off during `[describe period, e.g., "the holiday spike in December"]` — walk through whether this is a missing holiday regressor, a changepoint detection issue, or a genuine anomaly outside the model's training distribution.
10. Write code to detect anomalies in my time series using `[STL residual thresholding / a seasonal-hybrid ESD approach]`, and distinguish a true anomaly from a legitimate but unusual seasonal peak.

## Advanced prompts (architecture, optimization, edge cases)

1. I need to forecast `[N thousand]` related series (e.g., per-SKU demand) at once — compare a global gradient-boosted tree model trained across all series with series ID as a feature versus per-series classical models versus a deep learning approach like a Temporal Fusion Transformer, on training cost and accuracy trade-offs.
2. Design a hierarchical reconciliation approach (e.g., MinT trace minimization) for forecasts produced independently at `[levels, e.g., "national, regional, store"]`, and explain how to validate that the reconciled forecasts actually improve accuracy at each level versus the unreconciled baseline.
3. My series has a structural break — `[describe, e.g., "a step change in the trend after a product relaunch"]` — walk through how to detect the changepoint statistically and whether I should retrain on post-break data only, weight recent data more heavily, or build a regime-switching model.
4. I want prediction intervals that are well-calibrated, not just symmetric assumptions around a point forecast — compare conformal prediction for time series, quantile regression, and a Bayesian structural time series approach for generating those intervals on `[describe series]`.
5. Design a backtesting strategy for `[N]`-step-ahead forecasts where I need to evaluate performance separately at each horizon step (1-step versus `[N]`-step) because the use case (`[describe]`) cares more about near-term accuracy.
6. I'm scaling a forecasting pipeline from `[N]` series to `[M, much larger]` series — walk through the engineering and modeling trade-offs of moving from per-series models to a single global model, including how to handle cold-start series with little history.
7. Critique my plan to use an N-BEATS or Temporal Fusion Transformer model on a dataset with only `[N]` historical points per series — is there enough data, and what pooling-across-series or transfer-learning approach would make a deep learning model viable here?
8. Help me design an approach for forecasting a series with intermittent demand (`[describe, e.g., "mostly zero with occasional spikes"]`) where standard MAPE is undefined or misleading — compare Croston's method, TSB, and a zero-inflated model approach.
9. I need to incorporate exogenous regressors that are themselves forecasts (e.g., a weather or macroeconomic forecast feeding into my demand model) — explain how to propagate that input uncertainty into my own forecast's prediction interval instead of treating the regressor forecast as known with certainty.
10. Design a monitoring system for a production forecasting pipeline covering `[N]` series that flags when actual values fall outside the predicted interval too often, distinguishing a single-series anomaly from a systematic model degradation across many series.

## Follow-up / chaining prompts

1. Given the STL decomposition results above showing `[describe trend/seasonality pattern]`, now recommend the specific SARIMA order or Prophet seasonality configuration that matches what we just saw.
2. Based on the stationarity test result (`[ADF/KPSS outcome]`), show me the exact differencing or transformation code to apply before fitting the ARIMA model.
3. Now that we've identified the residual autocorrelation issue at lag `[N]`, give me the updated model specification and show me the before/after Ljung-Box test result I should expect.
4. Take the rolling-origin backtest results comparing `[model A]` and `[model B]` and tell me which one I should put into production given that this use case weights `[1-step vs longer-horizon]` accuracy more heavily.
5. Given the hierarchical reconciliation output above, show me how much the regional-level forecast changed after reconciliation compared to the unreconciled bottom-up sum.
6. Now that we've diagnosed the holiday-effect miss, walk me through adding the specific holiday regressor to the model and show me the expected change in forecast error around that period.

## Anti-patterns: prompts that get weak answers

**Weak:** "How do I forecast my time series?"
**Sharper:** "I have 3 years of daily sales data with clear weekly and yearly seasonality and a few known promotional spikes — compare SARIMA, Prophet, and a LightGBM model with lag features for this specific combination of seasonality and known event regressors."

**Weak:** "Is my data stationary?"
**Sharper:** "Run me through interpreting an Augmented Dickey-Fuller test where my p-value is 0.18 and a KPSS test where I also fail to reject the null of stationarity — what does this disagreement mean, and what differencing should I try next?"

**Weak:** "My forecast is wrong, help."
**Sharper:** "My SARIMA(1,1,1)(1,1,1,7) model underforecasts every December by roughly 20% — help me determine whether this is a missing holiday regressor, an unmodeled changepoint, or a multiplicative seasonality issue I'm treating as additive."

**Weak:** "How do I evaluate my forecast accuracy?"
**Sharper:** "I'm comparing two models' 12-week-ahead forecasts using rolling-origin backtesting over 18 monthly origins — should I report MAPE, sMAPE, or pinball loss given that my series has values near zero in some months, and how do I report accuracy separately by horizon step?"

**Weak:** "Can you help me forecast all my products?"
**Sharper:** "I need to forecast demand for 2,000 SKUs where 30% have fewer than 8 weeks of history — compare a single global LightGBM model with SKU embeddings versus per-SKU classical models for handling these cold-start series specifically."
