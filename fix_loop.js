const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const files = ['index.html', 'euro.html', 'grid.html', 'position.html', 'oddeven.html', 'total.html'];

const oldString = `  if (res.status === 401) {
    window.location.href = 'login.html';
  }`;

const newString = `  if (res.status === 401) {
    localStorage.removeItem('couponCode');
    localStorage.removeItem('sessionToken');
    window.location.href = 'login.html';
  }`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(oldString)) {
    content = content.replace(oldString, newString);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
