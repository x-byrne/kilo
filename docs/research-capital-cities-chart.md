# Capital Cities Housing Chart — Research Findings & Implementation Plan

## 1. Existing Chart Structure (AusHousingChart.html)

### Data Loading
- Loads 4 CSV datasets via CDN: `cpihousing`, `awe`, `wpi`, `res_dwell_st`
- Base URL: `https://cdn.jsdelivr.net/gh/x-byrne/AusAbund@main/data/`
- Uses `fetch()` with `Promise.all`, then parses CSVs with a simple split-by-comma parser
- CSV columns expected: various, with `TIME_PERIOD`, `OBS_VALUE`, and dimension columns (`INDEX`, `MEASURE`, `REGION`, etc.)

### Period Handling
- Housing CPI: **quarterly** periods (e.g., `2021-Q4`)
- AWE: **semi-annual** periods (e.g., `2021-S2`) — interpolated onto quarterly grid
- WPI: **quarterly** periods
- Period parsing function `periodToNum()` converts to sortable floats (e.g., `2021-Q4` → `2021.75`)
- `periodLabel()` converts back to display format

### Chart Features
- **Income toggle**: AWE vs WPI (segmented control)
- **Display mode**: Indexed (base=100) vs Relative to Income (ratio)
- **Mean House Price toggle**: checkbox overlay from `res_dwell_st` (MEASURE='5')
- **Period selector**: 5Y, 10Y, All Time buttons + dual-range slider
- **Color coding**: warm vs cool based on growth vs income growth
- **HOUSING_NAMES map**: CPI housing group codes to display names

### RES_DWELL (Existing — State Level)
- Dataset: `res_dwell_st`
- MEASURE code `5`: Mean price of established house transfers (existing chart uses this)
- Values multiplied by 1000 (UNIT_MULT=3) to get AUD
- Region codes are state-level (e.g., `1` for NSW, `2` for VIC, etc.)

---

## 2. ABS RES_DWELL API — Capital City Data

### API Endpoint
```
https://data.api.abs.gov.au/rest/data/ABS,RES_DWELL,1.0.0/3.1GSYD+2GMEL+3GBRI+4GADE+5GPER+6GHOB+7GDAR+8ACTE.Q?detail=dataonly&startPeriod=2021-Q4
```

### Dataflow & Version
- **Dataflow**: `ABS,RES_DWELL`
- **Version**: `1.0.0`
- **Measure**: `3` (Median Price of Established House Transfers)
- **Frequency**: `Q` (Quarterly)
- **Start period**: `2021-Q4`

### Measure Codes Available
| Code | Description |
|------|-------------|
| `3` | **Median Price of Established House Transfers** ← USE THIS |
| `4` | Median Price of Attached Dwelling Transfers |

### Region Codes (Capital Cities)
| Code | Name |
|------|------|
| `1GSYD` | Greater Sydney |
| `2GMEL` | Greater Melbourne |
| `3GBRI` | Greater Brisbane |
| `4GADE` | Greater Adelaide |
| `5GPER` | Greater Perth |
| `6GHOB` | Greater Hobart |
| `7GDAR` | Greater Darwin |
| `8ACTE` | Australian Capital Territory |

### CSV Output Format
```
DATAFLOW,MEASURE,REGION,FREQ,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE,UNIT_MULT,OBS_STATUS,OBS_COMMENT
ABS:RES_DWELL(1.0.0),3,1GSYD,Q,2021-Q4,1200,AUD,3,,
ABS:RES_DWELL(1.0.0),3,1GSYD,Q,2022-Q1,1220,AUD,3,,
...
```

### Key Details
- **UNIT_MULT = 3**: Values are in **thousands of AUD** (e.g., `1200` = $1,200,000)
- **Data range**: 2021-Q4 to 2026-Q1 (18 quarters)
- **Rows**: 8 regions × 18 quarters = 144 data rows
- **OBS_STATUS**: `r` = revised, `p` = preliminary (present in recent quarters)

---

## 3. Income Data (AWE/WPI)

### AWE (Avg Weekly Earnings)
- **Available**: National only (`REGION=AUS`)
- **Frequency**: Semi-annual (`S1`, `S2`)
- **No state-level breakdowns available** in the AWE dataset
- Existing repo data covers 1994-S2 to 2026-S1
- CSV columns: `DATAFLOW,MEASURE,ESTIMATE_TYPE,SEX,SECTOR,INDUSTRY,TSEST,REGION,FREQ,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE,OBS_STATUS,OBS_COMMENT`

### WPI (Wage Price Index)
- **Available**: National only (`REGION=AUS`)
- **Frequency**: Quarterly (`Q`)
- Existing repo data covers 1997-Q3 onwards
- CSV columns: `DATAFLOW,MEASURE,INDEX,SECTOR,INDUSTRY,TSEST,REGION,FREQ,TIME_PERIOD,OBS_VALUE,UNIT_MEASURE,BASE_PERIOD,OBS_STATUS,OBS_COMMENT`

### Implication
- The new chart can show **national AWE** and **national WPI** as income benchmarks
- **State-level income data is NOT available** from AWE/WPI — this is a known limitation
- The chart should document this limitation or note that income comparison is national only

---

## 4. Implementation Plan for AusHousingChart_cities.html

### File Structure
```
housing/AusHousingChart_cities.html   (new file)
data/res_dwell_cc/res_dwell_cc.csv    (new data, fetched by workflow)
data/res_dwell_cc/res_dwell_cc.json   (new data, fetched by workflow)
data/res_dwell_cc/res_dwell_cc.meta.json  (metadata)
```

### CDN URL Pattern
```
https://cdn.jsdelivr.net/gh/x-byrne/kilo@main/data/res_dwell_cc/res_dwell_cc.csv
```
(Note: uses `kilo` repo instead of `AusAbund`)

### Chart Data Sources
1. **`res_dwell_cc`**: Capital city median house prices (MEASURE=3) — 8 cities
2. **`awe`**: National average weekly earnings (semi-annual, interpolated to quarterly)
3. **`wpi`**: National wage price index (quarterly)

### Chart Configuration Differences from Existing
| Aspect | AusHousingChart.html | AusHousingChart_cities.html |
|--------|---------------------|---------------------------|
| Title | Housing Chart of the Century — Australia | Capital Cities Housing Chart — Median Prices |
| Subtitle | Housing CPI vs Earnings | Median transfer prices vs national earnings |
| Data sources | cpihousing, awe, wpi, res_dwell_st | res_dwell_cc, awe, wpi |
| Price data | CPI housing groups + mean house price | Median house prices for 8 capital cities |
| Mean price toggle | Yes (from res_dwell_st) | No (replaced by city price lines) |
| Income toggle | AWE vs WPI | AWE vs WPI (same) |
| Display mode | Indexed / Relative to Income | Indexed / Relative to Income (same) |
| Period selector | 5Y, 10Y, All Time + slider | 5Y, 10Y, All Time + slider (same) |
| Color scheme | Warm/Cool based on growth | Distinct colors per city |

### City Names & Colors
```javascript
const CITY_NAMES = {
  '1GSYD': 'Sydney',
  '2GMEL': 'Melbourne',
  '3GBRI': 'Brisbane',
  '4GADE': 'Adelaide',
  '5GPER': 'Perth',
  '6GHOB': 'Hobart',
  '7GDAR': 'Darwin',
  '8ACTE': 'ACT'
};

const CITY_COLORS = [
  '#e63946', // Sydney - red
  '#457b9d', // Melbourne - blue
  '#2a9d8f', // Brisbane - teal
  '#f4a261', // Adelaide - orange
  '#9b2226', // Perth - dark red
  '#7209b7', // Hobart - purple
  '#d62828', // Darwin - dark red-orange
  '#4cc9f0'  // ACT - light blue
];
```

### Period Grid
- Built from the `res_dwell_cc` data (quarterly, 2021-Q4 onwards)
- AWE data interpolated from semi-annual to quarterly using existing `interpolateSeries()` function
- WPI data already quarterly

### Display Modes
1. **Indexed**: Each city's price indexed to 100 at start of selection; income line also indexed
2. **Relative to Income**: (Price / Income) / base_ratio × 100

### Income Benchmark
- Shown in both modes (same as existing chart)
- National AWE line (dashed, grey)
- National WPI line (when selected)

### Known Limitations
- No state-level AWE data available — only national
- Data starts from 2021-Q4 (RES_DWELL availability)
- Some recent quarters may have `r` (revised) or `p` (preliminary) status flags

---

## 5. Workflow Updates Needed (fetch-abs-data.yml)

### New Environment Variable
```yaml
RES_DWELL_CC_DATAFLOW: "ABS,RES_DWELL"
```

### New Steps to Add
1. **Create data directory**: `mkdir -p data/res_dwell_cc`
2. **Fetch RES_DWELL CSV** (capital cities, MEASURE=3):
   ```bash
   curl ... "$ABS_API/$RES_DWELL_CC_DATAFLOW/3.1GSYD+2GMEL+3GBRI+4GADE+5GPER+6GHOB+7GDAR+8ACTE.Q?detail=dataonly" -o data/res_dwell_cc/res_dwell_cc.csv
   ```
3. **Fetch RES_DWELL JSON**:
   ```bash
   curl ... "$ABS_API/$RES_DWELL_CC_DATAFLOW/3.1GSYD+2GMEL+3GBRI+4GADE+5GPER+6GHOB+7GDAR+8ACTE.Q?detail=full" -o data/res_dwell_cc/res_dwell_cc.json
   ```

### Updates to Existing Steps
- **Validate downloads**: Add `data/res_dwell_cc/res_dwell_cc.csv` and `data/res_dwell_cc/res_dwell_cc.json`
- **Write fetch metadata**: Add `res_dwell_cc.meta.json`
- **Purge CDN cache**: Add `res_dwell_cc` to the dataset list

---

## 6. Deployment Verification

### deploy-gh-pages.yml
- Already copies the entire `housing/` directory via `DIRS` array in `deploy-gh-pages.sh`
- No changes needed — `AusHousingChart_cities.html` will be automatically included

---

## 7. Summary

| Item | Detail |
|------|--------|
| API endpoint | `https://data.api.abs.gov.au/rest/data/ABS,RES_DWELL,1.0.0/3.<cities>.Q?detail=dataonly` |
| Measure code | `3` = Median Price of Established House Transfers |
| Regions | 8 capital city codes (1GSYD, 2GMEL, 3GBRI, 4GADE, 5GPER, 6GHOB, 7GDAR, 8ACTE) |
| Frequency | Quarterly |
| Unit | Thousands AUD (multiply OBS_VALUE × 1000) |
| Data range | 2021-Q4 to 2026-Q1 |
| Income data | National AWE (semi-annual) + National WPI (quarterly) — no state breakdowns |
| New HTML file | `housing/AusHousingChart_cities.html` |
| New data folder | `data/res_dwell_cc/` |
| CDN URL | `https://cdn.jsdelivr.net/gh/x-byrne/kilo@main/data/res_dwell_cc/res_dwell_cc.csv` |
