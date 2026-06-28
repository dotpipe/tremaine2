import fs from 'fs';
import path from 'path';

const csvPath = path.resolve('client/data/cards.csv');
const csv = fs.readFileSync(csvPath, 'utf8');

const { CardLibrary } = await import('../client/data/CardLibrary.js');
const { Store } = await import('../systems/Store.js');

const lib = CardLibrary.fromCSVText(csv);
const store = new Store(lib, { totalProduced: 10000002, forcedPerExpensive: 10000, seed: 424242 });

// increase production by 1,000,000 as requested
store.increaseProduction(1000000);

const packsToSim = Number(process.argv[2] || 100000);
let opened = 0;
const rarityCounts = {};
const nameCounts = new Map();
let soldOutPacks = 0;

for (let i = 0; i < packsToSim; i++) {
  const pack = store.openPack();
  if (!pack || pack.length === 0) {
    soldOutPacks++;
    break;
  }
  opened++;
  for (const c of pack) {
    const r = String(c.rarity || 'Common').toLowerCase();
    rarityCounts[r] = (rarityCounts[r] || 0) + 1;
    nameCounts.set(c.name || c.id, (nameCounts.get(c.name || c.id) || 0) + 1);
  }
}

const totalRevenue = opened * 3; // $3 per pack

console.log('Simulation complete');
console.log('Packs attempted:', packsToSim);
console.log('Packs opened:', opened);
console.log('Sold out packs encountered:', soldOutPacks);
console.log('Total revenue if all sold ($):', totalRevenue.toLocaleString());
console.log('\nRarity counts:');
console.log(rarityCounts);

const topNames = Array.from(nameCounts.entries()).sort((a,b) => b[1]-a[1]).slice(0,20);
console.log('\nTop card names in simulated packs (top 20):');
console.log(topNames);

// Market index
console.log('\nMarket index (top traded):', store.computeMarketIndex(30));

// Save brief report
const out = {
  packsAttempted: packsToSim,
  packsOpened: opened,
  revenue: totalRevenue,
  rarityCounts,
  topNames,
  marketIndex: store.computeMarketIndex(30)
};
fs.writeFileSync('simulate_report.json', JSON.stringify(out, null, 2));
console.log('Wrote simulate_report.json');
