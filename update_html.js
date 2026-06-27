const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const files = ['index.html', 'euro.html', 'grid.html', 'oddeven.html', 'position.html'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the data arrays with the data.js inclusion
  if (file === 'index.html') {
    content = content.replace(/<script>\s*const DRAWS = \[.*?\];\s*\/\/\s*array of \[5 numbers\], newest first/s, '<script src="data.js"></script>\n<script>\nconst DRAWS = DRAWS_MAIN_ONLY;');
  } else if (file === 'euro.html') {
    content = content.replace(/<script>\s*const EURO = \[.*?\];\s*\/\/\s*\[\{d:date, e:\[a,b\]\}\], newest first/s, '<script src="data.js"></script>\n<script>');
  } else {
    // grid.html, oddeven.html, position.html
    // they use const DRAWS = [{"d":"...","n":[...]},...]; // newest first or similar
    content = content.replace(/<script>\s*const DRAWS = \[.*?\];\s*(?:\/\/\s*\[\{d,n:\[5\]\}\], newest first|\/\/\s*newest first)?/s, '<script src="data.js"></script>\n<script>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
