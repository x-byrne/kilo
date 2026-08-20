import { HousingProcessor } from './src/HousingProcessor.js';

const AppState = {
    projections: [],
    historical: [],
    inputs: {
        migrationRate: 200000,
        avgHouseholdSize: 2.5,
        annualBuilds: 180000,
        naturalIncreaseRate: 0.005,
        showPrice: false
    }
};

async function init() {
    try {
        const [popRes, dwgRes, priceRes] = await Promise.all([
            fetch('https://data.api.abs.gov.au/rest/data/ABS,ERP_COMP_Q,1.0.0/9+10.AUS.Q?startPeriod=2011-Q1&dimensionAtObservation=AllDimensions&format=jsondata'),
            fetch('https://data.api.abs.gov.au/rest/data/ABS,RES_DWELL_ST,1.0.0/4.AUS.Q?startPeriod=2011-Q3&dimensionAtObservation=AllDimensions&format=jsondata'),
            fetch('https://raw.githubusercontent.com/x-byrne/AusAbund/main/data/res_dwell_st/res_dwell_st.json')
        ]);

        const popData = await popRes.json();
        const dwgData = await dwgRes.json();
        const priceData = await priceRes.json();
        
        AppState.historical = transformAbsData(popData, dwgData, priceData);

        document.getElementById('simulateBtn').addEventListener('click', updateSimulation);
        document.getElementById('priceToggle').addEventListener('change', (e) => {
            AppState.inputs.showPrice = e.target.checked;
            updateSimulation();
        });
        updateSimulation();
    } catch (e) {
        console.error("Failed to load historical data:", e);
    }
}

function transformAbsData(popData, dwgData, priceData) {
    const historical = {};
    const popObs = popData.data.dataSets[0].observations;
    const popDims = popData.data.structures[0].dimensions.observation;
    const timeIdx = popDims.findIndex(d => d.id === 'TIME_PERIOD');
    const measureIdx = popDims.findIndex(d => d.id === 'MEASURE');
    
    Object.entries(popObs).forEach(([key, val]) => {
        const parts = key.split(':');
        const measure = popDims[measureIdx].values[parts[measureIdx]].id;
        const time = popDims[timeIdx].values[parts[timeIdx]].id;
        const year = parseInt(time.split('-')[0]);
        
        if (!historical[year]) historical[year] = { year, population: 0, actualDwellings: 0, netOverseasMigration: 0, popQuarters: 0, migQuarters: 0, dwgQuarters: 0, meanPrice: 0, priceQuarters: 0 };
        
        if (measure === '10') {
            historical[year].population = (parseFloat(val[0]) * 1000);
            historical[year].popQuarters += 1;
        } else if (measure === '9') {
            historical[year].netOverseasMigration += (parseFloat(val[0]) * 1000);
            historical[year].migQuarters += 1;
        }
    });

    const dwgObs = dwgData.data.dataSets[0].observations;
    const dwgDims = dwgData.data.structures[0].dimensions.observation;
    const dwgTimeIdx = dwgDims.findIndex(d => d.id === 'TIME_PERIOD');
    const dwgMeasureIdx = dwgDims.findIndex(d => d.id === 'MEASURE');
    
    Object.entries(dwgObs).forEach(([key, val]) => {
        const parts = key.split(':');
        const measure = dwgDims[dwgMeasureIdx].values[parts[dwgMeasureIdx]].id;
        if (measure === '4') {
            const time = dwgDims[dwgTimeIdx].values[parts[dwgTimeIdx]].id;
            const year = parseInt(time.split('-')[0]);
            if (historical[year]) {
                historical[year].actualDwellings = (parseFloat(val[0]) * 1000);
                historical[year].dwgQuarters += 1;
            }
        }
    });

    // Parse Mean Price from AusAbund res_dwell_st JSON
    if (priceData && priceData.data && priceData.data.dataSets && priceData.data.dataSets[0]) {
        const priceObs = priceData.data.dataSets[0].observations;
        const priceDims = priceData.data.structures[0].dimensions.observation;
        const priceTimeIdx = priceDims.findIndex(d => d.id === 'TIME_PERIOD');
        const priceMeasureIdx = priceDims.findIndex(d => d.id === 'MEASURE');
        
        Object.entries(priceObs).forEach(([key, val]) => {
            const parts = key.split(':');
            const measure = priceDims[priceMeasureIdx].values[parts[priceMeasureIdx]].id;
            if (measure === '5') {
                const time = priceDims[priceTimeIdx].values[parts[priceTimeIdx]].id;
                const year = parseInt(time.split('-')[0]);
                if (historical[year]) {
                    historical[year].meanPrice = (parseFloat(val[0]) * 1000);
                    historical[year].priceQuarters += 1;
                }
            }
        });
    }

    const sortedYears = Object.keys(historical).sort((a, b) => parseInt(a) - parseInt(b));

    const quarterlyMap = { mig: {}, pop: {}, dwg: {}, price: {} };
    
    Object.entries(popObs).forEach(([key, val]) => {
        const parts = key.split(':');
        const measure = popDims[measureIdx].values[parts[measureIdx]].id;
        const time = popDims[timeIdx].values[parts[timeIdx]].id;
        const year = parseInt(time.split('-')[0]);
        const q = parseInt(time.split('-Q')[1]);
        if (!quarterlyMap.mig[year]) quarterlyMap.mig[year] = {};
        if (!quarterlyMap.pop[year]) quarterlyMap.pop[year] = {};
        
        if (measure === '9') quarterlyMap.mig[year][q] = parseFloat(val[0]) * 1000;
        if (measure === '10') quarterlyMap.pop[year][q] = parseFloat(val[0]) * 1000;
    });

    Object.entries(dwgObs).forEach(([key, val]) => {
        const parts = key.split(':');
        const measure = dwgDims[dwgMeasureIdx].values[parts[dwgMeasureIdx]].id;
        const time = dwgDims[dwgTimeIdx].values[parts[dwgTimeIdx]].id;
        const year = parseInt(time.split('-')[0]);
        const q = parseInt(time.split('-Q')[1]);
        if (!quarterlyMap.dwg[year]) quarterlyMap.dwg[year] = {};
        if (measure === '4') quarterlyMap.dwg[year][q] = parseFloat(val[0]) * 1000;
    });

    if (priceData && priceData.data && priceData.data.dataSets && priceData.data.dataSets[0]) {
        const priceObs = priceData.data.dataSets[0].observations;
        const priceDims = priceData.data.structures[0].dimensions.observation;
        const priceTimeIdx = priceDims.findIndex(d => d.id === 'TIME_PERIOD');
        const priceMeasureIdx = priceDims.findIndex(d => d.id === 'MEASURE');
        
        Object.entries(priceObs).forEach(([key, val]) => {
            const parts = key.split(':');
            const measure = priceDims[priceMeasureIdx].values[parts[priceMeasureIdx]].id;
            if (measure === '5') {
                const time = priceDims[priceTimeIdx].values[parts[priceTimeIdx]].id;
                const year = parseInt(time.split('-')[0]);
                const q = parseInt(time.split('-Q')[1]);
                if (!quarterlyMap.price[year]) quarterlyMap.price[year] = {};
                quarterlyMap.price[year][q] = parseFloat(val[0]) * 1000;
            }
        });
    }

    sortedYears.forEach((year, i) => {
        const h = historical[year];
        const prevYear = sortedYears[i - 1];

        ['mig', 'pop', 'dwg', 'price'].forEach(type => {
            const countKey = type === 'mig' ? 'migQuarters' : (type === 'pop' ? 'popQuarters' : (type === 'dwg' ? 'dwgQuarters' : 'priceQuarters'));
            const valueKey = type === 'mig' ? 'netOverseasMigration' : (type === 'pop' ? 'population' : (type === 'dwg' ? 'actualDwellings' : 'meanPrice'));
            
            if (h[countKey] > 0 && h[countKey] < 4) {
                if (type === 'mig') {
                    if (i > 0 && quarterlyMap[type][prevYear]) {
                        const prevQuarters = quarterlyMap[type][prevYear];
                        for (let q = h[countKey] + 1; q <= 4; q++) {
                            h.netOverseasMigration += (prevQuarters[q] || 0);
                        }
                    }
                } else {
                    const prevData = quarterlyMap[type][prevYear];
                    const prevQ4 = prevData ? prevData[4] : null;
                    const quarters = quarterlyMap[type][year];
                    const lastQ = quarters ? Math.max(...Object.keys(quarters).map(Number)) : 0;
                    const lastVal = quarters && lastQ > 0 ? quarters[lastQ] : null;
                    
                    if (prevQ4 && lastVal) {
                        const delta = (lastVal - prevQ4) / lastQ;
                        const projected = lastVal + (delta * (4 - lastQ));
                        
                        if (type === 'pop') h.population = projected;
                        else if (type === 'dwg') h.actualDwellings = projected;
                        else if (type === 'price') h.meanPrice = projected;
                    }
                }
                h[countKey] = 4;
            }
        });
    });

    const y2025 = historical[2025];
    if (y2025) console.log(`[Verification] 2025 Pop: ${y2025.population}, NOM: ${y2025.netOverseasMigration}, Price: ${y2025.meanPrice}`);
    return Object.values(historical).sort((a, b) => a.year - b.year);
}

function updateSimulation() {
    AppState.inputs.migrationRate = parseInt(document.getElementById('migration').value);
    AppState.inputs.avgHouseholdSize = parseFloat(document.getElementById('householdSize').value);
    AppState.inputs.annualBuilds = parseInt(document.getElementById('builds').value);
    AppState.inputs.naturalIncreaseRate = parseFloat(document.getElementById('naturalIncrease').value) / 100;
    AppState.inputs.historicalData = AppState.historical;

    AppState.projections = HousingProcessor.project(AppState.inputs);
    render();
}

function render() {
    const tableBody = document.getElementById('tableBody');
    const showPrice = AppState.inputs.showPrice;
    
    tableBody.innerHTML = AppState.projections.map((p, i, arr) => {
        let dwellingDiff = '';
        if (!p.isProjection && i > 0) {
            const diff = p.actualDwellings - arr[i - 1].actualDwellings;
            const color = diff >= 0 ? 'green' : 'red';
            dwellingDiff = ` <span style="color:${color};">(${diff >= 0 ? '+' : ''}${diff.toLocaleString()})</span>`;
        }
        
        let popDiff = '';
        if (i > 0) {
            const diff = p.population - arr[i - 1].population;
            const color = diff >= 0 ? 'green' : 'red';
            popDiff = ` <span style="color:${color};">(${diff >= 0 ? '+' : ''}${diff.toLocaleString()})</span>`;
        }

        let priceCell = '';
        if (showPrice) {
            const priceVal = p.meanPrice ? Math.round(p.meanPrice).toLocaleString() : '-';
            let priceDiff = '';
            if (!p.isProjection && i > 0 && arr[i-1].meanPrice) {
                const diff = p.meanPrice - arr[i - 1].meanPrice;
                const color = diff >= 0 ? 'green' : 'red';
                priceDiff = ` <span style="color:${color};">(${diff >= 0 ? '+' : ''}${Math.round(diff).toLocaleString()})</span>`;
            }
            priceCell = `<td>$${priceVal}${priceDiff}</td>`;
        }
        
        return `
        <tr>
            <td>${p.year}</td>
            <td>${p.population.toLocaleString()}${popDiff}</td>
            <td>${p.netOverseasMigration ? Math.round(p.netOverseasMigration).toLocaleString() : '-'}</td>
            <td>${p.actualDwellings.toLocaleString()}${dwellingDiff}</td>
            <td>${p.requiredDwellings ? p.requiredDwellings.toLocaleString() : '-'}</td>
            ${priceCell}
        </tr>
    `}).join('');

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('housingChart');
    if (!ctx) return;
    
    const showPrice = AppState.inputs.showPrice;
    const labels = AppState.projections.map(p => p.year);
    const populations = AppState.projections.map(p => p.population / 1e6);
    const actualDwellings = AppState.projections.map(p => p.actualDwellings / 1e6);
    const requiredDwellings = AppState.projections.map(p => p.requiredDwellings ? p.requiredDwellings / 1e6 : null);
    const meanPrices = showPrice ? AppState.projections.map(p => p.meanPrice ? p.meanPrice / 1e3 : null) : [];

    const datasets = [
        {
            label: 'Population (M)',
            data: populations,
            borderColor: '#264653',
            backgroundColor: '#264653',
            tension: 0.2,
            yAxisID: 'y'
        },
        {
            label: 'Actual Dwellings (M)',
            data: actualDwellings,
            borderColor: '#2a9d8f',
            backgroundColor: '#2a9d8f',
            tension: 0.2,
            yAxisID: 'y'
        },
        {
            label: 'Required Dwellings (M)',
            data: requiredDwellings,
            borderColor: '#e76f51',
            backgroundColor: '#e76f51',
            borderDash: [5, 5],
            tension: 0.2,
            yAxisID: 'y'
        }
    ];

    if (showPrice) {
        datasets.push({
            label: 'Mean House Price ($000s)',
            data: meanPrices,
            borderColor: '#c9a84c',
            backgroundColor: '#c9a84c',
            tension: 0.2,
            yAxisID: 'y1'
        });
    }

    if (window.housingChart) {
        window.housingChart.destroy();
    }

    const scales = {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Millions' }
        }
    };

    if (showPrice) {
        scales.y1 = {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Mean Price ($000s)' },
            grid: { drawOnChartArea: false }
        };
    }

    window.housingChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales
        }
    });
}

init();