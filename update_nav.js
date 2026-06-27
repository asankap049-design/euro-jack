const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');
const files = ['index.html', 'euro.html', 'grid.html', 'position.html', 'oddeven.html', 'total.html'];

const navCss = `
  /* New Premium Bottom Nav */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(20, 24, 38, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-around;
    padding: 8px 2px calc(8px + env(safe-area-inset-bottom));
    z-index: 1000;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
  }
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: #7a85a3;
    font-size: 9px;
    font-weight: 700;
    transition: all 0.3s ease;
    gap: 4px;
    min-width: 44px;
  }
  .nav-item .icon {
    font-size: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: transparent;
    transition: all 0.3s ease;
  }
  .nav-item:active {
    transform: scale(0.92);
  }
  .nav-item.active {
    color: #ffb52e;
  }
  .nav-item.active .icon {
    background: rgba(255, 181, 46, 0.15);
    color: #ffb52e;
    box-shadow: 0 0 15px rgba(255, 181, 46, 0.1);
  }
`;

function getNavHtml(activeFile) {
  return `
  <div class="bottom-nav">
    <a href="../index.html" class="nav-item">
      <span class="icon">🏠</span>
      <span>Home</span>
    </a>
    <a href="index.html" class="nav-item ${activeFile === 'index.html' ? 'active' : ''}">
      <span class="icon">🔢</span>
      <span>Main</span>
    </a>
    <a href="euro.html" class="nav-item ${activeFile === 'euro.html' ? 'active' : ''}">
      <span class="icon">🇪🇺</span>
      <span>Euro</span>
    </a>
    <a href="grid.html" class="nav-item ${activeFile === 'grid.html' ? 'active' : ''}">
      <span class="icon">⬜</span>
      <span>Grid</span>
    </a>
    <a href="position.html" class="nav-item ${activeFile === 'position.html' ? 'active' : ''}">
      <span class="icon">📍</span>
      <span>Pos</span>
    </a>
    <a href="oddeven.html" class="nav-item ${activeFile === 'oddeven.html' ? 'active' : ''}">
      <span class="icon">⚖️</span>
      <span>O/E</span>
    </a>
    <a href="total.html" class="nav-item ${activeFile === 'total.html' ? 'active' : ''}">
      <span class="icon">📊</span>
      <span>Total</span>
    </a>
  </div>
  `;
}

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove old bottom nav completely
  content = content.replace(/<div class="bottom-nav">[\s\S]*?<\/div>\s*<\/div>/g, '');
  content = content.replace(/<div class="bottom-nav">[\s\S]*?<\/div>\s*$/m, ''); // If it's at the end
  content = content.replace(/<div class="bottom-nav">[\s\S]*?<\/div>\s*<div class="foot"/g, '<div class="foot"');

  const navHtml = getNavHtml(file);
  
  if (content.includes('<div class="foot"')) {
    content = content.replace(/<div class="foot"/, navHtml + '\n  <div class="foot"');
  } else {
    content = content.replace(/<script type="module">/, navHtml + '\n<script type="module">');
  }

  // Update CSS
  content = content.replace(/\.bottom-nav \{[\s\S]*?\.nav-item\.active \.icon \{[\s\S]*?\}/, navCss.trim());

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Navigation Updated in ${file}`);
});
