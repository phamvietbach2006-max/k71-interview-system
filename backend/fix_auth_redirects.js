const fs = require('fs');

const files = [
  { file: 'frontend/src/pages/AdminView.jsx', condition: '!user.username || !isSuperAdmin' },
  { file: 'frontend/src/pages/ReceptionistView.jsx', condition: "!user.username || user.role !== 'receptionist'" },
  { file: 'frontend/src/pages/InterviewerView.jsx', condition: '!user' }
];

files.forEach(({ file, condition }) => {
  let code = fs.readFileSync(file, 'utf-8');
  
  let regex = /if\s*\([^)]+\)\s*return\s*<div[^>]*>Truy c.p b. t. ch.i\.[^<]*<\/div>;/;
  if (file.includes('InterviewerView')) {
    regex = /if\s*\(\!user\)\s*return\s*<div[^>]*>.*?<\/div>;/;
  }
  
  const effect = `
  useEffect(() => {
    if (${condition}) {
      navigate('/');
    }
  }, [navigate]);

  if (${condition}) return null;
`;
  
  if (regex.test(code)) {
    code = code.replace(regex, effect);
    fs.writeFileSync(file, code, 'utf-8');
    console.log('Fixed auth redirect in ' + file);
  } else {
    console.log('Could not find auth check in ' + file);
  }
});
