const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let a = fs.readFileSync(adminPath, 'utf-8');

// B3: Import toast
if (!a.includes('import toast')) {
  a = a.replace(`import Swal from 'sweetalert2';`, `import Swal from 'sweetalert2';\nimport toast from 'react-hot-toast';`);
}

// B4: Fixed API endpoint
a = a.replace(`fetch('/api/candidates', {`, `fetch('/api/candidates/add', {`);

// L5 & B3 error handling fixes
a = a.replace(/toast\(data\.error\)/g, `toast.error(data.error)`);
a = a.replace(/toast\(err\.message\)/g, `toast.error(err.message)`);

// Delete user Swal fix
const oldDelete = `    const handleDeleteUser = async (username) => {
      if (!window.confirm(\`Bạn có chắc muốn xóa tài khoản \${username} không?\`)) return;
      try {
        const res = await fetch(\`/api/users/\${username}\`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          fetchUsers();
        } else {
          toast.error(data.error);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };`;

const newDelete = `    const handleDeleteUser = async (username) => {
      const result = await Swal.fire({
        title: 'Bạn chắc chắn chứ?',
        text: \`Xóa tài khoản \${username} không thể hoàn tác!\`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa ngay!',
        cancelButtonText: 'Hủy'
      });
      
      if (!result.isConfirmed) return;
      
      try {
        const res = await fetch(\`/api/users/\${username}\`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          toast.success('Đã xóa tài khoản');
          fetchUsers();
        } else {
          toast.error(data.error);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };`;

// Regex replacement because of encoding
const oldDeleteRegex = /const handleDeleteUser = async \(username\) => \{[\s\S]*?if \(!window\.confirm[\s\S]*?toast\.error\(err\.message\);\s*\}\s*\};/;
a = a.replace(oldDeleteRegex, newDelete);

fs.writeFileSync(adminPath, a, 'utf-8');
console.log('AdminView bug fixes restored.');
