const fs = require('fs');
const path = require('path');

// ============================================================
// Fix ReceptionistView.jsx - same race condition pattern
// ReceptionistView reads user directly from localStorage (not state)
// so it's slightly different - but the useEffect auth check has
// user.username in dependency which causes re-runs
// The REAL issue: user is derived from localStorage each render,
// so if localStorage is cleared mid-session, it crashes.
// Fix: wrap user in useState and use isLoaded pattern.
// ============================================================

const recPath = path.join(__dirname, '../frontend/src/pages/ReceptionistView.jsx');
let rec = fs.readFileSync(recPath, 'utf-8');

// The current code has:
// const user = JSON.parse(localStorage.getItem('user')) || {};
// useEffect(() => { if (!user.username || user.role !== 'receptionist') navigate('/'); }, [user.username, user.role, navigate]);
// Problem: user.username and user.role in deps array — object properties cause infinite re-runs if object is recreated

// Fix: make user a state variable to prevent re-creation on each render
// and add isLoaded pattern
rec = rec.replace(
  `  const user = JSON.parse(localStorage.getItem('user')) || {};
  const viewDepartment = user.department || 'TCKT';`,
  `  const [user, setUser] = React.useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [isLoaded, setIsLoaded] = React.useState(false);
  const viewDepartment = user.department || 'TCKT';`
);

// Fix the useEffect that reads user - add isLoaded setter
rec = rec.replace(
  `  useEffect(() => {
    socketRef.current = io('/');
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, []);`,
  `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored) setUser(stored);
    setIsLoaded(true);
    
    socketRef.current = io('/');
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, []);`
);

// Fix auth useEffect - use isLoaded
rec = rec.replace(
  `    useEffect(() => {
    if (!user.username || user.role !== 'receptionist') {
      navigate('/');
    }
  }, [user.username, user.role, navigate]);

  if (!user.username || user.role !== 'receptionist') return null;`,
  `  useEffect(() => {
    if (isLoaded && (!user.username || user.role !== 'receptionist')) {
      navigate('/');
    }
  }, [isLoaded, user, navigate]);

  if (!isLoaded) return null;
  if (!user.username || user.role !== 'receptionist') return null;`
);

fs.writeFileSync(recPath, rec, 'utf-8');

const recResult = fs.readFileSync(recPath, 'utf-8');
const hasIsLoaded = recResult.includes('const [isLoaded, setIsLoaded] = React.useState(false)');
const hasGuard = recResult.includes('if (isLoaded && (!user.username');
console.log('ReceptionistView.jsx fixed!');
console.log('✓ isLoaded added:', hasIsLoaded);
console.log('✓ auth guard fixed:', hasGuard);

// ============================================================
// Fix AdminView.jsx - same pattern
// ============================================================
const adminPath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let admin = fs.readFileSync(adminPath, 'utf-8');

// AdminView also reads user from localStorage directly as a const (not state)
// This is fine for reading but the auth useEffect has same race condition potential
admin = admin.replace(
  `  const user = JSON.parse(localStorage.getItem('user')) || {};\r\n  const isSuperAdmin = user.role === 'admin' || (user.roles && user.roles.includes('admin')) || user.fullName === 'Phạm Việt Bách' || user.username === 'Phạm Việt Bách';`,
  `  const [user, setUser] = React.useState(() => JSON.parse(localStorage.getItem('user')) || {});\r\n  const [isLoaded, setIsLoaded] = React.useState(false);\r\n  const isSuperAdmin = user.role === 'admin' || (user.roles && user.roles.includes('admin')) || user.fullName === 'Phạm Việt Bách' || user.username === 'Phạm Việt Bách';`
);

// Fix the initial socket useEffect to set isLoaded
admin = admin.replace(
  `  useEffect(() => {\r\n    socketRef.current = io('/');\r\n    fetchBoard();\r\n    const interval = setInterval(fetchBoard, 3000);\r\n    return () => {\r\n      clearInterval(interval);\r\n      socketRef.current.disconnect();\r\n    };\r\n  }, [viewDepartment]);`,
  `  useEffect(() => {\r\n    const stored = JSON.parse(localStorage.getItem('user'));\r\n    if (stored) setUser(stored);\r\n    setIsLoaded(true);\r\n    socketRef.current = io('/');\r\n    fetchBoard();\r\n    const interval = setInterval(fetchBoard, 3000);\r\n    return () => {\r\n      clearInterval(interval);\r\n      socketRef.current.disconnect();\r\n    };\r\n  }, [viewDepartment]);`
);

// Fix auth useEffect in AdminView
admin = admin.replace(
  `  useEffect(() => {\n    if (!user.username || !isSuperAdmin) {\n      navigate('/');\n    }\n  }, [navigate]);\n\n  if (!user.username || !isSuperAdmin) return null;`,
  `  useEffect(() => {\n    if (isLoaded && (!user.username || !isSuperAdmin)) {\n      navigate('/');\n    }\n  }, [isLoaded, user, navigate]);\n\n  if (!isLoaded) return null;\n  if (!user.username || !isSuperAdmin) return null;`
);

fs.writeFileSync(adminPath, admin, 'utf-8');

const adminResult = fs.readFileSync(adminPath, 'utf-8');
const adminHasLoaded = adminResult.includes('isLoaded');
console.log('\nAdminView.jsx fixed!');
console.log('✓ isLoaded added:', adminHasLoaded);
