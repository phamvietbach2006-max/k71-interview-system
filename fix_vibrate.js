const fs = require("fs");
let code = fs.readFileSync("frontend/src/pages/CandidateView.jsx", "utf8");

code = code.replace(
  `const [assignedRoom, setAssignedRoom] = useState(null);`,
  `const [assignedRoom, setAssignedRoom] = useState(null);\n  const alertIntervalRef = useRef(null);`
);

const oldPlayAlert = `const playAlertSound = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };`;

const newPlayAlert = `const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.5);
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
  };

  const startAlerts = () => {
    if (alertIntervalRef.current) return;
    playAlertSound();
    if (navigator.vibrate) navigator.vibrate([1000, 500, 1000, 500]);
    
    alertIntervalRef.current = setInterval(() => {
      playAlertSound();
      if (navigator.vibrate) navigator.vibrate([1000, 500, 1000, 500]);
    }, 3000);
  };

  const stopAlerts = () => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    if (navigator.vibrate) navigator.vibrate(0);
  };

  useEffect(() => {
    if (status === "moving") {
      startAlerts();
    } else {
      stopAlerts();
    }
    return () => stopAlerts();
  }, [status]);`;

code = code.replace(oldPlayAlert, newPlayAlert);

const oldSocketMove = `if (data.candidate.interviewCode === stored.interviewCode) {
        setStatus("moving");
        setAssignedTable(data.tableNumber);
        setAssignedRoom(data.roomNumber);
        playAlertSound();
        startFlashing();
      }`;
const newSocketMove = `if (data.candidate.interviewCode === stored.interviewCode) {
        setStatus("moving");
        setAssignedTable(data.tableNumber);
        setAssignedRoom(data.roomNumber);
        startFlashing();
      }`;
code = code.replace(oldSocketMove, newSocketMove);

fs.writeFileSync("frontend/src/pages/CandidateView.jsx", code, "utf8");
console.log("Fixed CandidateView.jsx");
