const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Login.jsx', 'utf-8');

if (!code.includes('useEffect(() => {')) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
  
  let redirectCode = `
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role && user.role !== 'candidate_completed') {
      navigate(\`/\${user.role}\`);
    }
  }, [navigate]);
  
  const handleLogin`;
  
  code = code.replace('const handleLogin', redirectCode);
  fs.writeFileSync('frontend/src/pages/Login.jsx', code, 'utf-8');
  console.log('Fixed auto-redirect in Login.jsx');
}
