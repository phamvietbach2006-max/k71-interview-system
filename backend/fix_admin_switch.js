const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/AdminView.jsx', 'utf-8');

if (!code.includes('const performSwitchToRole')) {
  const fn = `
  const performSwitchToRole = async (roleName, path) => {
    const res = await fetch('/api/staff/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, targetRole: roleName })
    });
    const data = await res.json();
    if (data.success) {
      const stored = JSON.parse(localStorage.getItem('user'));
      stored.role = roleName;
      localStorage.setItem('user', JSON.stringify(stored));
      window.location.href = path;
    }
  };\n`;
  code = code.replace(/(const navigate = useNavigate\(\);\n)/, '$1' + fn);
  fs.writeFileSync('frontend/src/pages/AdminView.jsx', code, 'utf-8');
  console.log("Added performSwitchToRole");
}
