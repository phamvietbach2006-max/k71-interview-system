const fs = require('fs');
const path = require('path');

const interviewerPath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let i = fs.readFileSync(interviewerPath, 'utf-8');

// 1. Add isLoaded to state
if (!i.includes('const [isLoaded')) {
  i = i.replace(`const [user, setUser] = useState(null);`, `const [user, setUser] = useState(null);\n  const [isLoaded, setIsLoaded] = useState(false);`);
}

// 2. Add setIsLoaded(true) to the initial mount useEffect
const oldEffect1 = `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'interviewer') {
      setUser(stored);
      setAutoAssign(stored.autoAssign === true);
      fetchBoard();
    }`;

const newEffect1 = `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'interviewer') {
      setUser(stored);
      setAutoAssign(stored.autoAssign === true);
      fetchBoard();
    }
    setIsLoaded(true);`;

if (!i.includes('setIsLoaded(true)')) {
  i = i.replace(oldEffect1, newEffect1);
  i = i.replace(oldEffect1.replace(/\n/g, '\r\n'), newEffect1);
}

// 3. Fix the redirect useEffect
const oldEffect2 = `  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [navigate]);`;

const newEffect2 = `  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/');
    }
  }, [isLoaded, user, navigate]);`;

if (i.includes(oldEffect2)) {
  i = i.replace(oldEffect2, newEffect2);
} else {
  // Try CRLF
  i = i.replace(oldEffect2.replace(/\n/g, '\r\n'), newEffect2);
}
// Try looser regex if not matched
if (!i.includes('if (isLoaded && !user)')) {
  i = i.replace(/useEffect\(\(\) => \{\s*if \(\!user\) \{\s*navigate\('\/'\);\s*\}\s*\}, \[navigate\]\);/, newEffect2);
}

fs.writeFileSync(interviewerPath, i, 'utf-8');
console.log('InterviewerView auth patched.');


const adminPath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let a = fs.readFileSync(adminPath, 'utf-8');

if (!a.includes('const [isLoaded')) {
  a = a.replace(`const [user, setUser] = useState(null);`, `const [user, setUser] = useState(null);\n  const [isLoaded, setIsLoaded] = useState(false);`);
}

const oldAdminEffect1 = `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'admin') {
      setUser(stored);
    }`;

const newAdminEffect1 = `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'admin') {
      setUser(stored);
    }
    setIsLoaded(true);`;

if (!a.includes('setIsLoaded(true)')) {
  a = a.replace(oldAdminEffect1, newAdminEffect1);
  a = a.replace(oldAdminEffect1.replace(/\n/g, '\r\n'), newAdminEffect1);
}

const oldAdminEffect2 = `  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);`;

const newAdminEffect2 = `  useEffect(() => {
    if (isLoaded && !user) navigate('/');
  }, [isLoaded, user, navigate]);`;

if (a.includes(oldAdminEffect2)) {
  a = a.replace(oldAdminEffect2, newAdminEffect2);
} else {
  a = a.replace(oldAdminEffect2.replace(/\n/g, '\r\n'), newAdminEffect2);
}
if (!a.includes('if (isLoaded && !user)')) {
  a = a.replace(/useEffect\(\(\) => \{\s*if \(\!user\) navigate\('\/'\);\s*\}, \[user, navigate\]\);/, newAdminEffect2);
}

fs.writeFileSync(adminPath, a, 'utf-8');
console.log('AdminView auth patched.');
