# Verification Report: datasets.json ↔ Workflow Alignment after API Fix

**Date:** 2026-08-12  
**Verified by:** Birch (polecat agent)  
**Related bead:** ae5b7999 (Toast — ABS API URL fix)

---

## 1. datasets.json Keys vs Workflow Data Directories

### datasets.json keys (15 total)
- `cpi`
- `cpigroups`
- `cpihousing`
- `awe`
- `lci`
- `lcigroups`
- `wpi`
- `population`
- `gdp`
- `households`
- `building_activity`
- `lending_housing`
- `labour_account`
- `household_spending`
- `labour_force`

### Workflow directories created (12 total)
`cpi`, `awe`, `wpi`, `lci`, `population`, `gdp`, `households`, `building_activity`, `lending_housing`, `labour_account`, `household_spending`, `labour_force`

### Mismatches
**3 datasets are declared in `datasets.json` but have NO corresponding fetch step or directory in the workflow:**
- `cpigroups`
- `cpihousing`
- `lcigroups`

### Status of Toast's Fix (ae5b7999)
Toast's fix has **NOT landed yet**. The branch `gt/toast/ae5b7999` is empty (no commits pushed). The workflow on `main` still uses the old broken URL format. Therefore, the 3 missing datasets have **not** been added by Toast's fix.

---

## 2. CDN URL Consistency

**File:** `src/loader/loader.js` (line 4)  
**Default repo value:** `x-byrne/kilo@main`

Status: **PASS** — the CDN URL uses the correct repo and branch.

---

## 3. Workflow Syntax

**File:** `.github/workflows/fetch-abs-data.yml`

- `yamllint` is not installed in this environment.
- Manual inspection: YAML structure is well-formed with proper indentation, key-value pairs, and GitHub Actions syntax.
- **However**, the workflow contains additional issues beyond syntax:

### URL Issues
1. **Missing `/rest/` segment**: All URLs use `https://data.api.abs.gov.au/data/...` instead of the required `/rest/data/...` pattern from AusAbund.
2. **Wrong endpoint format**: URLs use query-parameter style (`?dimension=Measure=1&format=CSV`) instead of the SDMX key style (`/1.10001.10.50.Q?detail=dataonly`).
3. **Hardcoded URLs**: The `ABS_API` environment variable is defined at line 13 (`https://data.api.abs.gov.au/data`) but all fetch steps use full hardcoded URLs instead of `$ABS_API`.

### Header Issues
1. **CSV Accept header**: Uses `application/vnd.sdmx.data+csv;version=1.0.0` — this is correct per AusAbund's pattern.
2. **JSON Accept header**: Uses `application/json` — should be `application/vnd.sdmx.data+json;version=1.0` per AusAbund.

### Retry Flags
- Uses `--retry 3 --retry-delay 5 --max-time 60` — matches the AusAbund pattern.

### Conclusion
The workflow **parses correctly as YAML**, but it is **NOT runnable as-is** because the ABS API URLs return 403 Forbidden (missing `/rest/` segment and wrong format). It will fail at runtime even though the YAML syntax is valid.

---

## 4. Summary

| Check | Status | Details |
|-------|--------|---------|
| datasets.json ↔ workflow alignment | **FAIL** | 3 datasets (`cpigroups`, `cpihousing`, `lcigroups`) declared but not fetched |
| CDN URL (loader.js) | **PASS** | Uses `x-byrne/kilo@main` |
| Workflow YAML syntax | **PASS** | Parses correctly |
| Workflow runnability | **FAIL** | URLs use broken `/data/` format; missing `/rest/` segment |
| Toast's fix landed | **FAIL** | Branch `gt/toast/ae5b7999` is empty; fix not merged |

### Recommendations
1. **Merge Toast's fix** (ae5b7999) to add the 3 missing datasets (`cpigroups`, `cpihousing`, `lcigroups`) to the workflow.
2. **Update all ABS API URLs** to use `/rest/data/` and the SDMX key format as specified in the AusAbund reference workflow.
3. **Fix JSON Accept header** to `application/vnd.sdmx.data+json;version=1.0`.
4. **Use the `ABS_API` env variable** in fetch steps rather than hardcoding full URLs.
5. **Install `yamllint`** in CI or local dev environment to automate YAML validation.
