const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');

const filesToFix = [
  { name: 'index.html', expose: 'window.clearAll = clearAll;' },
  { name: 'euro.html', expose: 'window.clearAll = clearAll;' },
  { name: 'grid.html', expose: 'window.clearAll = clearAll;' },
  { name: 'position.html', expose: 'window.setMode = setMode;\nwindow.clearSel = clearSel;\nwindow.toggleLabel = toggleLabel;' }
];

filesToFix.forEach(f => {
  const filePath = path.join(dir, f.name);
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject before </script> at the very end
  content = content.replace(/<\/script>\s*<\/body>/, `\n${f.expose}\n</script>\n</body>`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Exposed globals in ${f.name}`);
});
