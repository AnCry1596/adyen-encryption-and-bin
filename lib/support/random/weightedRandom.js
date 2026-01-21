// Weighted random selection
function getWeightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
        random -= (item.weight || 1);
        if (random <= 0) {
            return item;
        }
    }
    
    return items[items.length - 1]; // Fallback
}
module.exports = getWeightedRandom;