const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ReceptionistView.jsx', 'utf-8');

const regex = /\{user\.roles && user\.roles\.includes\('admin'\)[\s\S]*?Sang Ng\?i PV\n\s*<\/button>\n\s*\)\}/g;
// Replace all occurrences with just ONE set of buttons!
code = code.replace(regex, '');

const buttons = `            {user.roles && user.roles.includes('admin') && (
              <button onClick={() => performSwitchToRole('admin', '/admin')} className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Admin
              </button>
            )}
            {user.roles && user.roles.includes('interviewer') && (
              <button onClick={() => performSwitchToRole('interviewer', '/interviewer')} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Người PV
              </button>
            )}`;

code = code.replace(/<CheckCircle size=\{16\} \/> Check-in Hộ\n\s*<\/button>/, '<CheckCircle size={16} /> Check-in Hộ\n            </button>\n' + buttons);

fs.writeFileSync('frontend/src/pages/ReceptionistView.jsx', code, 'utf-8');
console.log("Cleaned up buttons");
