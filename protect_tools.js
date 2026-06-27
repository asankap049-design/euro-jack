const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const files = ['index.html', 'euro.html', 'grid.html', 'position.html', 'oddeven.html', 'total.html'];

const oldFetch = "const res = await fetch('/api/draws');";
const newFetch = `  const res = await fetch('/api/draws', {
    headers: {
      'x-coupon-code': localStorage.getItem('couponCode') || '',
      'x-session-token': localStorage.getItem('sessionToken') || ''
    }
  });
  if (res.status === 401) {
    window.location.href = 'login.html';
  }`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace only if not already replaced
  if (content.includes(oldFetch)) {
    content = content.replace(oldFetch, newFetch);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Protected ${file}`);
  }
});
