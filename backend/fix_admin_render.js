const fs = require('fs');

let code = fs.readFileSync('frontend/src/pages/AdminView.jsx', 'utf-8');

const matchStart = code.indexOf('{filteredUsers.map((u, index) => (');
const matchEnd = code.indexOf('{filteredUsers.length === 0', matchStart);

if (matchStart !== -1 && matchEnd !== -1) {
  const toReplace = code.substring(matchStart, matchEnd);
  
  const replacement = `{filteredUsers.map((u, index) => {
              const currentRoles = draftRoles[u.username] || u.roles || [];
              const currentDept = draftDepartments[u.username] !== undefined ? draftDepartments[u.username] : (u.department || "TCKT");
              const hasChanges = draftRoles[u.username] !== undefined || draftDepartments[u.username] !== undefined;

              return (
              <tr key={u.username} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                <td className="p-4 font-bold text-slate-500 text-center">{index + 1}</td>
                <td className="p-4 font-bold text-slate-800">{u.username}</td>
                <td className="p-4 text-slate-600 font-medium">{u.fullName || ""}</td>
                <td className="p-4">
                  <select 
                    value={currentDept}
                    onChange={(e) => setDraftDepartments({ ...draftDepartments, [u.username]: e.target.value })}
                    className="bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="TCKT">TCKT</option>
                    <option value="BCS">BCS</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-4">
                    {["admin", "interviewer", "receptionist"].map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={currentRoles.includes(role)} 
                          onChange={() => handleRoleToggle(u.username, u.roles, role)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">{role}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {hasChanges && (
                      <button onClick={() => saveUserChanges(u.username)} className="text-white font-bold bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors text-sm shadow-sm w-full">Xác Nhận</button>
                    )}
                    <button onClick={() => handleDeleteUser(u.username)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors text-sm w-full">Xóa</button>
                  </div>
                </td>
              </tr>
              )
            })}
            `;
            
    code = code.replace(toReplace, replacement);
    fs.writeFileSync('frontend/src/pages/AdminView.jsx', code, 'utf-8');
    console.log("Replaced renderUsersTable successfully!");
} else {
    console.log("Could not find block to replace");
}
