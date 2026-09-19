const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../backend/server.js');
let s = fs.readFileSync(serverPath, 'utf-8');

// Fix 1: evaluations candidateMap name lookup to support multiple keys
const oldMap = `    const candidateMap = {};\r\n    candidates.forEach(c => candidateMap[c.interviewCode] = c.applicationData?.['Họ và tên'] || c.interviewCode);`;
const newMap = `    const candidateMap = {};\r\n    candidates.forEach(c => {\r\n      const d = c.applicationData || {};\r\n      candidateMap[c.interviewCode] = d['Họ và tên'] || d['Họ tên'] || d['fullName'] || c.interviewCode;\r\n    });`;

if (s.includes(oldMap)) {
  s = s.replace(oldMap, newMap);
  console.log('Fixed evaluations candidateMap.');
} else {
  // Try without \r
  const oldMap2 = oldMap.replace(/\r\n/g, '\n');
  if (s.includes(oldMap2)) {
    s = s.replace(oldMap2, newMap.replace(/\r\n/g, '\n'));
    console.log('Fixed evaluations candidateMap (LF).');
  } else {
    console.log('WARN: Could not fix candidateMap - pattern not found');
  }
}

fs.writeFileSync(serverPath, s, 'utf-8');
console.log('server.js patch done.');
