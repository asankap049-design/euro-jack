const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const files = ['index.html', 'euro.html', 'grid.html', 'position.html', 'oddeven.html'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/\$\{activeFile === 'index\.html' \? 'active' : ''\}/g, file === 'index.html' ? 'active' : '');
  content = content.replace(/\$\{activeFile === 'euro\.html' \? 'active' : ''\}/g, file === 'euro.html' ? 'active' : '');
  content = content.replace(/\$\{activeFile === 'grid\.html' \? 'active' : ''\}/g, file === 'grid.html' ? 'active' : '');
  content = content.replace(/\$\{activeFile === 'position\.html' \? 'active' : ''\}/g, file === 'position.html' ? 'active' : '');
  content = content.replace(/\$\{activeFile === 'oddeven\.html' \? 'active' : ''\}/g, file === 'oddeven.html' ? 'active' : '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Navigation Fixed in ${file}`);
});
