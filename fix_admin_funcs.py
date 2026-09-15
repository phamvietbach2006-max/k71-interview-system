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
  };"""

code = code.replace("""  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsersList(data);
  };""", new_funcs)

with codecs.open("frontend/src/pages/AdminView.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

