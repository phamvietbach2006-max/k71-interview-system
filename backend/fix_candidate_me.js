const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/CandidateView.jsx', 'utf-8');

code = code.replace(/const me = all\.find\(c => c\.interviewCode === interviewCode\);/g, `const me = all.find(c => c.interviewCode === interviewCode && c.department === dept);`);

fs.writeFileSync('frontend/src/pages/CandidateView.jsx', code, 'utf-8');
console.log('Fixed fetchStatus me find!');
