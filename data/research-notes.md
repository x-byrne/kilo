# ABS Data API Research Notes

## API Endpoint

The ABS SDMX REST API is available at `https://data.api.abs.gov.au`.

Codelist discovery endpoint: `https://data.api.abs.gov.au/rest/dataflow/ABS/<ID>?references=all`
Data retrieval endpoint: `https://data.api.abs.gov.au/data/ABS,<ID>?dimension=<DIM>=<CODE>&format=CSV`

## Core Series

### GDP — `ABS,ANA_GG` (Australian National Accounts Key Aggregates)
- **Version**: 1.0.0
- **Dimensions**: MEASURE, DATA_ITEM, TSEST, REGION, FREQ
- **Item code for GDP**: `GPM` — Gross domestic product
- **Measure code for chain volume measures**: `M1`
- **TSEST code for seasonally adjusted**: `20`
- **Region code for Australia**: `AUS`
- **Frequency**: `Q` (Quarterly)
- **Recommended key**: `M1.GPM.20.AUS.Q`
- **Relevance**: GDP chain volume measures are the broadest economic deflator. Suitable for real (deflated) comparisons across all sectors.

### Population — `ABS,ERP_COMP_Q` (Population and components of change)
- **Version**: 1.0.0
- **Dimensions**: MEASURE, REGION, FREQ
- **Measure code for Estimated Resident Population**: `10`
- **Region code for Australia**: `AUS`
- **Frequency**: `Q` (Quarterly)
- **Recommended key**: `10.AUS.Q`
- **Relevance**: Total population for per-capita adjustment. Matches the series used by HousingAus.

### Household Estimates — `ABS,ABS_HH_PROV` (Household Projections)
- **Version**: 1.0.0
- **Dimensions**: ASGS_2011_STATE_GCCSA_SA4_SA3_SA2, HH_TYPE, PROJ_SERIES, FREQUENCY
- **Region code for Australia**: `0`
- **HH_TYPE code for Total households**: `4`
- **PROJ_SERIES code for Series I**: `1`
- **Frequency**: `Q` (Quarterly)
- **Recommended key**: `0.4.1.Q`
- **Note**: `ERP_HH` does not exist in the current ABS API. `ABS_HH_PROV` is the closest available series but contains **projections**, not observed estimates. Document this caveat for users.

## Additional Series Identified

### Building Activity — `ABS,BUILDING_ACTIVITY`
- **Version**: 1.0.0
- **Dimensions**: MEASURE, REGION, PRICE_ADJ, BLD_WORK_TYPE, SECTOR_OWN, TYPE_BLDG, TSEST, FREQ
- **Useful measure**: `M6` — Dwelling units commenced (building approvals proxy)
- **Price adjustment**: `CUR` (Current Price) or `CVM` (Chain Volume Measures)
- **Building type**: `100` — Total Residential
- **Sector**: `9` — Total Sectors
- **Work type**: `TOT` — Total Work
- **Recommended key**: `M6.AUS.CUR.TOT.9.100.20.Q`
- **Relevance**: Leading indicator for housing supply and construction activity.

### Housing Lending — `ABS,LEND_HOUSING`
- **Version**: 1.1
- **Dimensions**: MEASURE, DATA_ITEM, LOAN_TYPE, LOAN_PURPOSE, LENDER_TYPE, HOUSING_PURPOSE, TSEST, REGION, FREQ
- **Useful item**: `NEWCOMMITS` — New loan commitments
- **Measure**: `FIN_NUM` — Number
- **Loan purpose**: `TOTLOANPURP` — Total purpose including refinancing
- **Lender type**: `TOT` — Total lender type
- **Housing purpose**: `TOT` — Total housing purpose
- **Recommended key**: `FIN_NUM.NEWCOMMITS.DV8575.TOTLOANPURP.TOT.TOT.20.AUS.Q`
- **Relevance**: Housing finance commitments correlate with housing demand and credit conditions.

### Labour Account Quarterly — `ABS,LABOUR_ACCT_Q`
- **Version**: 1.1
- **Dimensions**: TSEST, FREQ, MEASURE, LABOURACCT_IND, ASGS_2016
- **Useful industry**: `TOTAL` — Total all industries
- **Useful measure**: `TOTAL` or equivalent for total employment/jobs
- **Region**: `AUS` (if available in ASGS_2016)
- **Recommended key**: `20.Q.TOTAL.TOTAL.AUS`
- **Relevance**: Sectoral employment and hours data for labour-market analysis.

### Household Spending Indicator — `ABS,HSI_Q`
- **Version**: 1.2.0
- **Dimensions**: MEASURE, CATEGORY, PRICE_ADJUSTMENT, TSEST, STATE, FREQ
- **Useful measure**: `4` — Household spending - Index
- **Category**: `TOT` — Total
- **Price adjustment**: `CVM` — Chain Volume Measures
- **TSEST**: `20` — Seasonally Adjusted
- **Region**: `AUS` — Australia
- **Recommended key**: `4.TOT.CVM.20.AUS.Q`
- **Relevance**: Real household consumption trends.

### Labour Force — `ABS,LF`
- **Version**: 1.0.0
- **Dimensions**: MEASURE, SEX, AGE, TSEST, REGION, FREQ
- **Useful measures**: `M9` — Labour Force, `M3` — Employed persons, `M13` — Unemployment rate
- **Sex**: `3` — Persons
- **Age**: `1599` — Total (age)
- **Recommended keys**:
  - Labour Force: `M9.3.1599.20.AUS.Q`
  - Employed persons: `M3.3.1599.20.AUS.Q`
  - Unemployment rate: `M13.3.1599.20.AUS.Q`
- **Relevance**: Standard employment/unemployment metrics.

## Datasets Not Found in ABS SDMX API

- **Interest rates / Cash rate**: Not published by ABS (RBA data). `ABS_MONETARY_ACCOUNT` is environmental land-use data, not financial interest rates.
- **Retail trade**: No dedicated retail trade dataflow found. The closest is `LABOUR_ACCT_Q` which includes retail trade under ANZSIC division G.
- **Consumer sentiment / Confidence**: No dedicated ABS dataflow found (Roy Morgan / ANZ / Westpac publish these separately).

## Summary of Recommended Additions

| Dataset | Dataflow | Key | Frequency | Category |
|---|---|---|---|---|
| gdp | ABS,ANA_AGG | M1.GPM.20.AUS.Q | Quarterly | National Accounts |
| population | ABS,ERP_COMP_Q | 10.AUS.Q | Quarterly | Population |
| households | ABS,ABS_HH_PROV | 0.4.1.Q | Quarterly | Population |
| building_activity | ABS,BUILDING_ACTIVITY | M6.AUS.CUR.TOT.9.100.20.Q | Quarterly | Housing |
| lending_housing | ABS,LEND_HOUSING | FIN_NUM.NEWCOMMITS.DV8575.TOTLOANPURP.TOT.TOT.20.AUS.Q | Quarterly | Housing |
| labour_account | ABS,LABOUR_ACCT_Q | 20.Q.TOTAL.TOTAL.AUS | Quarterly | Employment |
| household_spending | ABS,HSI_Q | 4.TOT.CVM.20.AUS.Q | Quarterly | Economy |
| labour_force | ABS,LF | M9.3.1599.20.AUS.Q | Quarterly | Employment |
