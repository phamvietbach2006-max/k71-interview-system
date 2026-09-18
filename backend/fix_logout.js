const fs = require('fs');

const files = [
  { path: 'frontend/src/pages/AdminView.jsx', insertAfter: 'const navigate = useNavigate();' },
  { path: 'frontend/src/pages/InterviewerView.jsx', insertAfter: 'const navigate = useNavigate();' },
  { path: 'frontend/src/pages/ReceptionistView.jsx', insertAfter: 'const navigate = useNavigate();' }
];

files.forEach(f => {
  let code = fs.readFileSync(f.path, 'utf-8');
  
  // Add LogOut to lucide-react import
  if (!code.includes('LogOut')) {
    code = code.replace("import { ", "import { LogOut, ");
  }

  // Add handleLogout
  if (!code.includes('const handleLogout')) {
    let logoutFunc = `
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };\n`;
    code = code.replace(f.insertAfter, f.insertAfter + logoutFunc);
  }

  // Add the button to the header
  if (!code.includes('onClick={handleLogout}')) {
    let btn = `
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <LogOut size={16} /> Đăng xuất
              </button>\n`;
              
    // Find the end of the action buttons group
    code = code.replace(/<div className="flex items-center gap-3">/, '<div className="flex items-center gap-3">' + btn);
  }
  
  fs.writeFileSync(f.path, code, 'utf-8');
  console.log('Fixed ' + f.path);
});

// For CandidateView
let cvCode = fs.readFileSync('frontend/src/pages/CandidateView.jsx', 'utf-8');
if (!cvCode.includes('LogOut')) {
  cvCode = cvCode.replace("import { CheckCircle2,", "import { LogOut, CheckCircle2,");
  let logoutBtn = `
        <div className={\`relative z-10 w-full max-w-md p-4 transition-all duration-500 \${flash ? 'scale-105' : ''}\`}>
          <button 
            onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }} 
            className="absolute -top-8 right-4 bg-white/30 hover:bg-white text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm backdrop-blur-md transition-all flex items-center gap-2"
          >
            <LogOut size={14} /> Đăng xuất
          </button>`;
  cvCode = cvCode.replace(/<div className=\{\`relative z-10 w-full max-w-md p-4 transition-all duration-500 \$\{flash \? 'scale-105' : ''\}\`\}>/, logoutBtn);
  fs.writeFileSync('frontend/src/pages/CandidateView.jsx', cvCode, 'utf-8');
  console.log('Fixed frontend/src/pages/CandidateView.jsx');
}

