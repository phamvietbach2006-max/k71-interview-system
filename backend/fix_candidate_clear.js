const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/CandidateView.jsx', 'utf-8');

if (!code.includes('setAssignedTable(null);')) {
  code = code.replace(/setStatus\('active'\);/g, "setStatus('active');\n         setAssignedTable(null);\n         setAssignedRoom(null);");
  fs.writeFileSync('frontend/src/pages/CandidateView.jsx', code, 'utf-8');
  console.log('Fixed checkNextDepartment to clear room and table!');
} else {
  console.log('Already fixed.');
}
