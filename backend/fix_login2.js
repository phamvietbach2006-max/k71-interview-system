const fs = require('fs');

let code = fs.readFileSync('backend/server.js', 'utf-8');

let startIndex = code.indexOf('// 2. Check if Staff (case-insensitive)');
if (startIndex !== -1) {
  let ifStart = code.indexOf('if (user) {', startIndex);
  if (ifStart !== -1) {
    let beforeIf = code.substring(0, ifStart + 'if (user) {'.length);
    let afterIf = code.substring(ifStart + 'if (user) {'.length);
    
    let replacement = `
        const { password } = req.body;
        const expectedPassword = user.password || 'Abc@123';
        
        if (!password) {
          return res.json({ success: true, requirePassword: true });
        }
        
        if (password !== expectedPassword) {
          return res.status(401).json({ success: false, message: 'Sai mật khẩu!' });
        }
`;
    fs.writeFileSync('backend/server.js', beforeIf + replacement + afterIf, 'utf-8');
    console.log('Fixed server.js');
  }
}
