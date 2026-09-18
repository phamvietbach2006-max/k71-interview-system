const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ReceptionistView.jsx', 'utf-8');

let oldStr = `  if (!user.username || user.role !== 'receptionist') {
    return <div className="min-h-screen flex items-center justify-center">Truy cp b< t ch\`i. (C n quy?n L. TAn)</div>;
  }`;

let newStr = `  useEffect(() => {
    if (!user.username || user.role !== 'receptionist') {
      navigate('/');
    }
  }, [user.username, user.role, navigate]);

  if (!user.username || user.role !== 'receptionist') return null;`;

if (code.includes('user.role !== \'receptionist\') {')) {
  // Try regex if exact match fails
  let regex = /if\s*\(\!user\.username \|\| user\.role !== 'receptionist'\)\s*\{\s*return <div[^>]*>.*?<\/div>;\s*\}/;
  code = code.replace(regex, newStr);
  fs.writeFileSync('frontend/src/pages/ReceptionistView.jsx', code, 'utf-8');
  console.log('Fixed ReceptionistView.jsx');
}
