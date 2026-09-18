const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/ReceptionistView.jsx', 'utf-8');
code = code.replace('const handleManualCheckIn = () => {', 'const handleManualCheckIn = async () => {');
fs.writeFileSync('frontend/src/pages/ReceptionistView.jsx', code, 'utf-8');
console.log('Fixed ReceptionistView.jsx');
