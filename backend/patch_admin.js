const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// B3: Add toast import
c = c.replace(
  "import Swal from 'sweetalert2';\r\nimport React, { useState, useEffect, useRef } from 'react';",
  "import Swal from 'sweetalert2';\nimport React, { useState, useEffect, useRef } from 'react';\nimport toast from 'react-hot-toast';"
);

// B4: Fix wrong API endpoint in handleAddCandidate
c = c.replace(
  "const res = await fetch('/api/candidates', {\r\n      method: 'POST',\r\n      headers: { 'Content-Type': 'application/json' },\r\n      body: JSON.stringify(newCandidate)",
  "const res = await fetch('/api/candidates/add', {\r\n      method: 'POST',\r\n      headers: { 'Content-Type': 'application/json' },\r\n      body: JSON.stringify(newCandidate)"
);

// L5: Replace window.confirm with Swal
c = c.replace(
  `  const handleDeleteUser = async (username) => {\r
    if (!window.confirm(\`Bạn có chắc muốn xóa tài khoản \${username} không?\`)) return;\r
    try {\r
      const res = await fetch(\`/api/users/\${username}\`, { method: 'DELETE' });\r
      const data = await res.json();\r
      if (data.success) {\r
        fetchUsers();\r
      } else {\r
        toast(data.error);\r
      }\r
    } catch (err) {\r
      toast(err.message);\r
    }\r
  };`,
  `  const handleDeleteUser = async (username) => {
    const confirmResult = await Swal.fire({
      title: 'Xác nhận xóa',
      text: \`Bạn có chắc muốn xóa tài khoản "\${username}" không? Hành động này không thể hoàn tác.\`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });
    if (!confirmResult.isConfirmed) return;
    try {
      const res = await fetch(\`/api/users/\${username}\`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xóa tài khoản thành công!');
        fetchUsers();
      } else {
        toast.error(data.error || 'Lỗi khi xóa');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };`
);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('AdminView.jsx patched successfully!');

// Verify
const result = fs.readFileSync(filePath, 'utf-8');
const hasToast = result.includes("import toast from 'react-hot-toast'");
const hasCorrectEndpoint = result.includes('/api/candidates/add');
const hasSwal = result.includes('Swal.fire') && result.includes('Xác nhận xóa');
console.log('✓ toast imported:', hasToast);
console.log('✓ correct API endpoint:', hasCorrectEndpoint);
console.log('✓ Swal confirm:', hasSwal);
