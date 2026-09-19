const fs = require('fs');

const adminPath = 'frontend/src/pages/AdminView.jsx';
let a = fs.readFileSync(adminPath, 'utf-8');

// Fix: add department filter to fetchEvaluations
const oldFetch = `  const fetchEvaluations = async () => {
    const res = await fetch('/api/evaluations');
    const data = await res.json();
    setEvaluations(data);
  };`;

const newFetch = `  const fetchEvaluations = async () => {
    const deptQuery = viewDepartment ? \`?department=\${viewDepartment}\` : '';
    const res = await fetch(\`/api/evaluations\${deptQuery}\`);
    const data = await res.json();
    setEvaluations(data);
  };`;

if (a.includes(oldFetch)) {
  a = a.replace(oldFetch, newFetch);
  console.log('Patched fetchEvaluations with department filter.');
} else {
  // try with \r\n
  const oldFetch2 = oldFetch.replace(/\n/g, '\r\n');
  const newFetch2 = newFetch.replace(/\n/g, '\r\n');
  if (a.includes(oldFetch2)) {
    a = a.replace(oldFetch2, newFetch2);
    console.log('Patched fetchEvaluations (CRLF).');
  } else {
    console.log('ERROR: Pattern not found. Lines around fetch:');
    const idx = a.indexOf('/api/evaluations');
    console.log(a.slice(Math.max(0, idx - 100), idx + 100));
  }
}

fs.writeFileSync(adminPath, a, 'utf-8');
