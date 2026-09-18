const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Login.jsx', 'utf-8');

let searchStr = `// Step 1: Verify Code (MSSV/PVxxx)
    if (step === 1) {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.requireDepartment) {`;
        
let replacementStr = `// Step 1 or 1.2: Verify Code and Password
    if (step === 1 || step === 1.2) {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), password })
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.requirePassword) {
          setStep(1.2);
        } else if (data.requireDepartment) {`;

code = code.replace(searchStr, replacementStr);
fs.writeFileSync('frontend/src/pages/Login.jsx', code, 'utf-8');
console.log('Fixed Step 1 logic!');
