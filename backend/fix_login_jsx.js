const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/Login.jsx', 'utf-8');

// 1. Add password state
code = code.replace("const [code, setCode] = useState('');", "const [code, setCode] = useState('');\n  const [password, setPassword] = useState('');");

// 2. Modify handleLogin
let handleLoginStr = `// Step 1: Verify Code (MSSV/PVxxx)
    if (step === 1) {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim() })
        });
        const data = await res.json();
        
        if (data.success) {
          if (data.requireDepartment) {`;
          
let replacementHandleLogin = `// Step 1 or 1.2: Verify Code (MSSV/PVxxx) and Password
    if (step === 1 || step === 1.2) {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim(), password })
        });
        const data = await res.json();
        
        if (data.success) {
          if (data.requirePassword) {
            setStep(1.2);
          } else if (data.requireDepartment) {`;
          
code = code.replace(handleLoginStr, replacementHandleLogin);

// 3. Add Step 1.2 UI
let step15UI = `{step === 1.5 && (`;
let step12UI = `{step === 1.2 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Nhập mật khẩu nhân sự: <span className="text-blue-500">*</span>
              </label>
              <div className="relative group animate-fade-in-up animation-delay-200">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <span className="font-bold">**</span>
                </div>
                <input 
                  type="password" 
                  required 
                  placeholder="Mật khẩu mặc định: Abc@123" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button type="button" onClick={() => {setStep(1); setPassword('');}} className="text-sm font-semibold text-blue-500 hover:text-blue-700 mt-2 block ml-1">&larr; Quay lại</button>
            </div>
          )}

          `;

code = code.replace(step15UI, step12UI + step15UI);

// 4. Update the button text logic
let btnStr = `{step === 1 ? 'TI_P T C' : step === 1.5 ? 'XA?C NHN VA?O PHA'NG CHo' : 'XA?C NHN VA?O BA?N'}`;
// Since there's weird encoding, I'll use regex for the button text.
let regexBtn = /\{step === 1 \? '([^']+)' : step === 1\.5 \? '([^']+)' : '([^']+)'\}/;
code = code.replace(regexBtn, "{step === 1 ? '$1' : step === 1.2 ? 'ĐĂNG NHẬP' : step === 1.5 ? '$2' : '$3'}");

fs.writeFileSync('frontend/src/pages/Login.jsx', code, 'utf-8');
console.log('Fixed Login.jsx');
