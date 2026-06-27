const fs = require('fs');
const content = fs.readFileSync('eurojackpot/data.js', 'utf8');
const match = content.match(/const EUROJACKPOT_DATA = (\[.*?\]);\s*\n/s);
if (match) {
  fs.writeFileSync('data.json', match[1], 'utf8');
  console.log('data.json created successfully.');
} else {
  console.log('Could not find data.');
}
