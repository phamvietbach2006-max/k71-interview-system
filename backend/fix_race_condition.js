const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// ROOT CAUSE FIX: The auth useEffect runs immediately on mount when user=null (initial state),
// before the first useEffect can call setUser(). This causes an immediate navigate('/').
//
// Solution: Add an `isLoaded` flag. Only navigate when we KNOW loading is complete
// but user is still null (meaning they genuinely aren't logged in).

// Step 1: Add isLoaded state after the other useState declarations
c = c.replace(
  `  const [showQueueModal, setShowQueueModal] = useState(false);\n  const [autoAssign, setAutoAssign] = useState(false);`,
  `  const [showQueueModal, setShowQueueModal] = useState(false);\n  const [autoAssign, setAutoAssign] = useState(false);\n  const [isLoaded, setIsLoaded] = useState(false); // track if localStorage has been read`
);

// Step 2: Mark isLoaded=true after reading localStorage in first useEffect
c = c.replace(
  `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'interviewer') {
      setUser(stored);
      setAutoAssign(stored.autoAssign === true);
      fetchBoard();
    }
    
    socketRef.current = io('/');
    socketRef.current.on('board_update', () => {
      if (stored) fetchBoard();
    });

    return () => socketRef.current.disconnect();
  }, []);`,
  `  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    if (stored && stored.role === 'interviewer') {
      setUser(stored);
      setAutoAssign(stored.autoAssign === true);
      fetchBoard();
    }
    setIsLoaded(true); // done reading localStorage
    
    socketRef.current = io('/');
    socketRef.current.on('board_update', () => {
      if (stored) fetchBoard();
    });

    return () => socketRef.current.disconnect();
  }, []);`
);

// Step 3: Fix auth useEffect to only navigate when ACTUALLY loaded and no user
c = c.replace(
  `  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;`,
  `  useEffect(() => {
    // Only redirect after we've confirmed localStorage has been read
    // Without isLoaded, this fires immediately on mount when user=null (race condition)
    if (isLoaded && !user) {
      navigate('/');
    }
  }, [isLoaded, user, navigate]);

  // Show nothing while loading from localStorage (prevents flash redirect)
  if (!isLoaded) return null;
  if (!user) return null;`
);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView.jsx race condition fixed!');

const result = fs.readFileSync(filePath, 'utf-8');
const hasIsLoaded = result.includes('const [isLoaded, setIsLoaded] = useState(false)');
const hasSetLoaded = result.includes('setIsLoaded(true)');
const hasGuard = result.includes('if (isLoaded && !user)');
console.log('✓ isLoaded state added:', hasIsLoaded);
console.log('✓ setIsLoaded(true) called:', hasSetLoaded);
console.log('✓ auth guard uses isLoaded:', hasGuard);
