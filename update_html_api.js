const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const files = ['index.html', 'euro.html', 'grid.html', 'oddeven.html', 'position.html'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove the script tag for data.js
  content = content.replace(/<script src="data\.js"><\/script>\s*\n/, '');

  // Replace <script> with <script type="module"> and data fetching
  const fetchLogic = `<script type="module">
  const res = await fetch('/api/draws');
  const EUROJACKPOT_DATA = await res.json();
  const DRAWS_MAIN_ONLY = EUROJACKPOT_DATA.map(x => x.n);
  const DRAWS = EUROJACKPOT_DATA.map(x => ({ d: x.d, n: x.n }));
  const EURO = EUROJACKPOT_DATA.filter(x => x.e).map(x => ({ d: x.d, e: x.e }));
`;

  // First we need to handle index.html where we added `const DRAWS = DRAWS_MAIN_ONLY;`
  // We can just replace the start of the script.
  content = content.replace(/<script>\nconst DRAWS = DRAWS_MAIN_ONLY;/, fetchLogic);
  content = content.replace(/<script>\nlet selected/, fetchLogic + '\nlet selected');
  content = content.replace(/<script>\nconst windows/, fetchLogic + '\nconst windows');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`API Updated ${file}`);
});
