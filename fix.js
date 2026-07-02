const fs = require('fs');
const f = 'src/app/admin/dian/page.tsx';
const content = fs.readFileSync(f, 'utf8');
fs.writeFileSync(f, content.replace(/\\"/g, '"'));
