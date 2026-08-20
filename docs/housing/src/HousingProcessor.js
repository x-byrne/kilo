export class HousingProcessor {
    static project(inputs) {
        const historical = inputs.historicalData || [];
        const projections = [...historical];
        
        let lastEntry = projections[projections.length - 1];
        let currentPop = lastEntry.population;
        let currentDwellings = lastEntry.actualDwellings;
        let currentMeanPrice = lastEntry.meanPrice || 0;
        
        const priceGrowthRate = inputs.meanPriceGrowthRate || 0.03;

        for (let year = lastEntry.year + 1; year <= 2046; year++) {
            const annualGrowth = inputs.migrationRate + (currentPop * inputs.naturalIncreaseRate);
            currentPop += annualGrowth;
            currentDwellings += inputs.annualBuilds;
            currentMeanPrice = currentMeanPrice > 0 ? currentMeanPrice * (1 + priceGrowthRate) : 0;
            
            projections.push({
                year,
                population: Math.round(currentPop),
                requiredDwellings: Math.round(currentPop / inputs.avgHouseholdSize),
                actualDwellings: Math.round(currentDwellings),
                netOverseasMigration: inputs.migrationRate,
                meanPrice: Math.round(currentMeanPrice),
                isProjection: true
            });
        }
        return projections;
    }
}