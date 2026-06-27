const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const gridPath = path.join(dir, 'grid.html');
const euroPath = path.join(dir, 'euro.html');
const indexPath = path.join(dir, 'index.html');
const oddevenPath = path.join(dir, 'oddeven.html');
const positionPath = path.join(dir, 'position.html');

// Read grid.html to extract main DRAWS
const gridContent = fs.readFileSync(gridPath, 'utf8');
const drawsMatch = gridContent.match(/const DRAWS = (\[.*?\]);/);
const mainDraws = JSON.parse(drawsMatch[1]);

// Read euro.html to extract EURO
const euroContent = fs.readFileSync(euroPath, 'utf8');
const euroMatch = euroContent.match(/const EURO = (\[.*?\]);/);
const euroDraws = JSON.parse(euroMatch[1]);

// Merge them
const merged = mainDraws.map(d => {
  const eDraw = euroDraws.find(e => e.d === d.d);
  if (eDraw) {
    return { d: d.d, n: d.n, e: eDraw.e };
  }
  return { d: d.d, n: d.n };
});

// Write to data.js
const dataJsContent = `// Centralized EuroJackpot Data
// Add new results at the TOP of this array.
// Format: { "d": "YYYY-MM-DD", "n": [main1, main2, main3, main4, main5], "e": [euro1, euro2] }
const EUROJACKPOT_DATA = ${JSON.stringify(merged, null, 2)};

// Helper arrays for the tools
const DRAWS = EUROJACKPOT_DATA.map(x => ({ d: x.d, n: x.n }));
const DRAWS_MAIN_ONLY = EUROJACKPOT_DATA.map(x => x.n);
const EURO = EUROJACKPOT_DATA.filter(x => x.e).map(x => ({ d: x.d, e: x.e }));
`;

fs.writeFileSync(path.join(dir, 'data.js'), dataJsContent, 'utf8');

console.log('data.js created successfully.');
