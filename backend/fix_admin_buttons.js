const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/AdminView.jsx', 'utf-8');

const regex = /\{\['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'\]\.includes\(user\.fullName\) && \([\s\S]*?Chuyển sang Người PV\n\s*<\/button>\n\s*<\/>\n\s*\)\}/;

const replaceWith = `{['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'].includes(user.fullName) && (
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
              )}`;

code = code.replace(regex, replaceWith);
fs.writeFileSync('frontend/src/pages/AdminView.jsx', code, 'utf-8');
