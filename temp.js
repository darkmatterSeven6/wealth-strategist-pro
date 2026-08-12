const fs = require('fs');
const path = './frontend/src/services/api.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(/fetch\(\`\$\{API_BASE\}\/([^`]+)\`\);/g, "fetch(`\${API_BASE}/$1`, { cache: 'no-store' });");
fs.writeFileSync(path, content);
console.log('Updated api.js');
