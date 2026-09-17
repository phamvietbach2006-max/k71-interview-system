const fs = require('fs');

function modifyFile(filePath, isInterviewer = false) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Add performSwitchToRole if not exists
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
    
    // insert after const navigate = useNavigate();
    code = code.replace(/(const navigate = useNavigate\(\);\n)/, '$1' + fn);
  }

  // Replace role switch buttons logic
  if (filePath.includes('AdminView')) {
    // replace old handleSwitchToInterviewer logic
    code = code.replace(/\{.*?includes\(user\.fullName\) && \([\s\S]*?<button[\s\S]*?onClick=\{handleCleanData\}[\s\S]*?<\/button>\n\s*<button[\s\S]*?onClick=\{handleSwitchToInterviewer\}[\s\S]*?<\/button>\n\s*<\/>\n\s*\)\}/, 
      `{['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'].includes(user.fullName) && (
        <button onClick={handleCleanData} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
          <Trash2 size={16} /> Làm sạch dữ liệu
        </button>
      )}
      {user.roles && user.roles.includes('interviewer') && (
        <button onClick={handleSwitchToInterviewer} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
          <RefreshCw size={16} /> Sang Người PV
        </button>
      )}
      {user.roles && user.roles.includes('receptionist') && (
        <button onClick={() => performSwitchToRole('receptionist', '/receptionist')} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
          <RefreshCw size={16} /> Sang Lễ Tân
        </button>
      )}`);
  } else if (filePath.includes('ReceptionistView')) {
    // replace inside header flex items-center gap-3
    const replacePattern = /<button[\s\S]*?onClick=\{handleManualCheckIn\}[\s\S]*?<\/button>/;
    code = code.replace(replacePattern, `$&
            {user.roles && user.roles.includes('admin') && (
              <button onClick={() => performSwitchToRole('admin', '/admin')} className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Admin
              </button>
            )}
            {user.roles && user.roles.includes('interviewer') && (
              <button onClick={() => performSwitchToRole('interviewer', '/interviewer')} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Người PV
              </button>
            )}`);
  } else if (filePath.includes('InterviewerView')) {
    // replace the specific admins check
    code = code.replace(/\{.*includes\(user\.fullName\) && \([\s\S]*?<button onClick=\{switchRole\}.*?>\s*<RefreshCw size=\{16\} \/> Admin\s*<\/button>\s*\)\}/, 
      `{user.roles && user.roles.includes('admin') && (
        <button onClick={() => performSwitchToRole('admin', '/admin')} className="ml-4 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-xl text-sm font-bold border border-amber-400 transition-all flex items-center gap-2 text-white shadow-sm">
          <RefreshCw size={16} /> Admin
        </button>
      )}
      {user.roles && user.roles.includes('receptionist') && (
        <button onClick={() => performSwitchToRole('receptionist', '/receptionist')} className="ml-4 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl text-sm font-bold border border-purple-400 transition-all flex items-center gap-2 text-white shadow-sm">
          <RefreshCw size={16} /> Lễ Tân
        </button>
      )}`);
      
    // remove switchRole
    code = code.replace(/const switchRole = async \(\) => \{[\s\S]*?\}\n\s*\};\n/g, '');
  }

  fs.writeFileSync(filePath, code, 'utf-8');
}

modifyFile('frontend/src/pages/AdminView.jsx');
modifyFile('frontend/src/pages/ReceptionistView.jsx');
modifyFile('frontend/src/pages/InterviewerView.jsx');

console.log('Modified all views');
