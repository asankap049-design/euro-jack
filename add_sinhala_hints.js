const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'eurojackpot');

const hints = {
  'index.html': "මෙම ටූල් එක මගින් ප්‍රධාන අංක 1 සිට 50 දක්වා ඔබ තෝරන අංක සමග ඉතිහාසයේ වැඩිපුරම දිනා ඇති අනෙකුත් අංක මොනවාදැයි පෙන්වයි. අංකයක් මත Click කර බලන්න.",
  'euro.html': "මෙම ටූල් එක මගින් යුරෝ අංක 1 සිට 12 දක්වා ඔබ තෝරන අංක සමග වැඩිපුරම දිනා ඇති අනෙකුත් යුරෝ අංක පෙන්වයි. අංකයක් මත Click කර බලන්න.",
  'grid.html': "පසුගිය දිනුම් වාරවලදී අංක වැටී ඇති රටාවන් මෙම Grid එක මතින් පෙන්වයි. වැඩිපුරම දිනන අංක සහ අංක වැටෙන කලාපයන් (Hot/Cold zones) මින් පහසුවෙන් හඳුනාගත හැක.",
  'position.html': "දිනුම් පතෙහි ඇති පේළි (Rows 1-10) සහ තීරු (Lines 1-5) අනුව පසුගිය ප්‍රතිඵල විශ්ලේෂණය කරයි. පේළියක නමක් (උදා: R1) මත Click කර එහි ඉතිහාසය බලන්න.",
  'oddeven.html': "පසුගිය දිනුම් වාරවලදී ඔත්තේ (Odd) සහ ඉරට්ටේ (Even) අංක වැටී ඇති ප්‍රතිශතයන් සහ රටාවන් මෙමගින් පෙන්වයි. ඉදිරි දිනුම් වාරය සඳහා අංක තෝරාගැනීමට මෙය උපකාරී වේ.",
  'total.html': "මෙමගින් දිනුම් වාරයක ප්‍රධාන අංක 5 හි එකතුව (Total Sum) විශ්ලේෂණය කරයි. එකතුව 15 සිට 240 දක්වා විය හැකි අතර, වැඩිපුරම දිනන එකතු පරාසයන් මින් බලාගත හැක."
};

const css = `
  .sin-hint {
    background: rgba(255, 181, 46, 0.08);
    border: 1px solid rgba(255, 181, 46, 0.2);
    border-radius: 12px;
    padding: 14px;
    margin: 24px 0 30px;
    font-size: 12px;
    color: #eef1f8;
    line-height: 1.6;
    text-align: center;
  }
  .sin-hint b {
    color: #ffb52e;
    font-size: 13px;
    display: block;
    margin-bottom: 4px;
  }
`;

Object.keys(hints).forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject CSS
  if (!content.includes('.sin-hint {') && content.includes('</style>')) {
    content = content.replace('</style>', css + '\n</style>');
  }

  // Remove existing sin-hint if we are running this multiple times
  content = content.replace(/<div class="sin-hint">[\s\S]*?<\/div>\s*/g, '');

  const hintHtml = `
  <div class="sin-hint">
    <b>මේ Tool එකෙන් වෙන්නේ කුමක්ද?</b>
    ${hints[file]}
  </div>
  `;

  // Inject before <div class="bottom-nav">
  if (content.includes('<div class="bottom-nav">')) {
    content = content.replace('<div class="bottom-nav">', hintHtml + '<div class="bottom-nav">');
  } else {
    // Fallback if bottom-nav is not found (unlikely)
    content = content.replace('</body>', hintHtml + '</body>');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Added Sinhala hint to ${file}`);
});
