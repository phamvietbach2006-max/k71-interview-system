const fs = require('fs');

let code = fs.readFileSync('backend/server.js', 'utf-8');

const regex = /\/\/ 2\. Check if Staff \(case-insensitive\)\s+const escapedCode = code\.replace\(\/\[-\[\\\]\{\}\(\)\*\+\?\.,\\\\(\^)\$\|\#\\s\]\/g, '\\\\\$&'\);\s+let user = await User\.findOne\(\{ username: \{ \$regex: new RegExp\(\`\^(\$\{escapedCode\})\$\`, 'i'\) \} \}\);\s+if \(user\) \{/;

const replacement = `// 2. Check if Staff (case-insensitive)
      const escapedCode = code.replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, '\\\\$&');
      let user = await User.findOne({ username: { $regex: new RegExp(\`^\${escapedCode}$\`, 'i') } });
      if (user) {
        const { password } = req.body;
        const expectedPassword = user.password || 'Abc@123';
        
        if (!password) {
          return res.json({ success: true, requirePassword: true });
        }
        
        if (password !== expectedPassword) {
          return res.status(401).json({ success: false, message: 'Sai mật khẩu!' });
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('backend/server.js', code, 'utf-8');
console.log('Fixed server.js');
