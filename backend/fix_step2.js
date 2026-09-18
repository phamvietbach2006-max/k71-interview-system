const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Login.jsx', 'utf-8');

let searchStr = `      else if (step === 2) {
        if (!tableNumber.trim() || !roomNumber.trim()) {
          toast.error("Vui lAng nh-p c s\` phAng vA s\` bAn!");
          return;
        }
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim(), roomNumber: roomNumber.trim(), tableNumber: tableNumber.trim() })
        });
        const data = await res.json();
  
        if (data.success) {`;
        
// The file has some weird encodings for Vietnamese text in the toast message!
// It's safer to use a regex replacement.

let newCode = code.replace(
  /body:\s*JSON\.stringify\(\{\s*code:\s*code\.trim\(\),\s*roomNumber:\s*roomNumber\.trim\(\),\s*tableNumber:\s*tableNumber\.trim\(\)\s*\}\)/,
  "body: JSON.stringify({ code: code.trim(), password: password, roomNumber: roomNumber.trim(), tableNumber: tableNumber.trim() })"
);

// To ensure we didn't just fail silently, we check if it changed
if (newCode !== code) {
  fs.writeFileSync('frontend/src/pages/Login.jsx', newCode, 'utf-8');
  console.log('Fixed Step 2 password issue!');
} else {
  console.log('Regex did not match!');
}
