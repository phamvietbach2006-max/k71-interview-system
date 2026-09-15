import codecs
with codecs.open("frontend/src/pages/AdminView.jsx", "r", "utf-8") as f:
    code = f.read()

new_state = """  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", fullName: "", department: "TCKT", roles: ["interviewer"] });
"""
code = code.replace("  const [isSuperAdmin, setIsSuperAdmin] = useState(false);", new_state)

new_funcs = """  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsersList(data);
  };

  const handleAddUser = async () => {
    if (!newUser.username) return alert("Vui lòng nhập tài khoản");
    try {
      const res = await fetch("/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã thêm nhân sự thành công!");
        setNewUser({ username: "", fullName: "", department: "TCKT", roles: ["interviewer"] });
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản ${username} không?`)) return;
    try {
      const res = await fetch(`/api/users/${username}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };
"""
code = code.replace("""  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsersList(data);
  };""", new_funcs)

old_ui = """              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8 border-b border-slate-100 pb-6">Quản Lý Nhân Sự</h2>
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-700 border-b-2 border-slate-200">
                      <th className="p-4 font-black tracking-wider uppercase text-sm">Tài Khoản</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm">Họ và Tên</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm">Ban</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm">Phân Quyền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.username} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{u.username}</td>
                        <td className="p-4 text-slate-600 font-medium">{u.fullName || ""}</td>
                        <td className="p-4">
                          <select 
                            value={u.department || "TCKT"}
                            onChange={(e) => fetch("/api/users/update", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: u.username, department: e.target.value }) }).then(fetchUsers)}
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
                                  checked={u.roles && u.roles.includes(role)}
                                  onChange={(e) => {
                                    const newRoles = e.target.checked ? [...(u.roles||[]), role] : (u.roles||[]).filter(r => r !== role);
                                    fetch("/api/users/update", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: u.username, roles: newRoles }) }).then(fetchUsers);
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700 capitalize">{role}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>"""

new_ui = """              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8 border-b border-slate-100 pb-6">Quản Lý Nhân Sự</h2>
              
              {/* Add New User */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Thêm nhân sự mới</h3>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Tài khoản</label>
                    <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="vd: nvam2026" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Họ và Tên</label>
                    <input type="text" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Ban</label>
                    <select value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} className="w-full border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="TCKT">TCKT</option>
                      <option value="BCS">BCS</option>
                    </select>
                  </div>
                  <button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-colors h-[42px]">Thêm Mới</button>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-700 border-b-2 border-slate-200">
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[20%]">Tài Khoản</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[25%]">Họ và Tên</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Ban</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-auto">Phân Quyền</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[10%] text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.username} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{u.username}</td>
                        <td className="p-4 text-slate-600 font-medium">{u.fullName || ""}</td>
                        <td className="p-4">
                          <select 
                            value={u.department || "TCKT"}
                            onChange={(e) => fetch("/api/users/update", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: u.username, department: e.target.value }) }).then(fetchUsers)}
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
                                  checked={u.roles && u.roles.includes(role)}
                                  onChange={(e) => {
                                    const newRoles = e.target.checked ? [...(u.roles||[]), role] : (u.roles||[]).filter(r => r !== role);
                                    fetch("/api/users/update", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: u.username, roles: newRoles }) }).then(fetchUsers);
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700 capitalize">{role}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleDeleteUser(u.username)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors text-sm">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>"""

if old_ui in code:
    code = code.replace(old_ui, new_ui)
else:
    print("Could not find old UI!")

with codecs.open("frontend/src/pages/AdminView.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

