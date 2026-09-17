const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ReceptionistView.jsx', 'utf-8');

// Find the Check-in button and delete everything until </div>
const checkInEnd = code.indexOf('Check-in Hộ');
if (checkInEnd !== -1) {
   const buttonEnd = code.indexOf('</button>', checkInEnd);
   const divEnd = code.indexOf('</div>', buttonEnd);
   
   const buttons = `
            {user.roles && user.roles.includes('admin') && (
              <button onClick={() => performSwitchToRole('admin', '/admin')} className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Admin
              </button>
            )}
            {user.roles && user.roles.includes('interviewer') && (
              <button onClick={() => performSwitchToRole('interviewer', '/interviewer')} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Người PV
              </button>
            )}
          `;
          
   code = code.substring(0, buttonEnd + 9) + buttons + code.substring(divEnd);
   fs.writeFileSync('frontend/src/pages/ReceptionistView.jsx', code, 'utf-8');
   console.log("Fixed buttons!");
}
