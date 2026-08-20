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

## 2. CDN URL Consistency

**File:** `src/loader/loader.js` (line 4)  
**Default repo value:** `x-byrne/kilo@main`

Status: **PASS** — the CDN URL uses the correct repo and branch.

## 3. Summary

| Check | Status | Details |
|-------|--------|---------|
| datasets.json ↔ workflow alignment | **FAIL** | 3 datasets (`cpigroups`, `cpihousing`, `lcigroups`) declared but not fetched |
| CDN URL (loader.js) | **PASS** | Uses `x-byrne/kilo@main` |
| Workflow YAML syntax | **PASS** | Parses correctly |
| Workflow runnability | **FAIL** | URLs use broken `/data/` format; missing `/rest/` segment |

### Recommendations
1. **Merge Toast's fix** (ae5b7999) to add the 3 missing datasets.
2. **Update all ABS API URLs** to use `/rest/data/` and the SDMX key format.
3. **Fix JSON Accept header** to `application/vnd.sdmx.data+json;version=1.0`.
