const fs = require('fs');

const files = [
  'frontend/src/pages/AdminView.jsx',
  'frontend/src/pages/InterviewerView.jsx',
  'frontend/src/pages/ReceptionistView.jsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');

  // Replace roomNum/tableNum window.prompt
  let startStr = `if (targetRole === 'interviewer') {`;
  let endStr = `if (!tableNum) return; // User cancelled or left empty`;
  
  let startIndex = code.indexOf(startStr);
  if (startIndex !== -1) {
    let endIndex = code.indexOf(endStr, startIndex);
    if (endIndex !== -1) {
      let originalBlock = code.substring(startIndex, endIndex + endStr.length);
      
      let replacement = `if (targetRole === 'interviewer') {
      const lastRoom = localStorage.getItem('lastRoomNumber') || "";
      const lastTable = localStorage.getItem('lastTableNumber') || "";
      
      const { value: formValues } = await Swal.fire({
        title: 'Thông tin Vị trí',
        html:
          '<input id="swal-input1" class="swal2-input" placeholder="Số Phòng (hoặc để trống)" value="' + lastRoom + '">' +
          '<input id="swal-input2" class="swal2-input" placeholder="Số Bàn (Bắt buộc)" value="' + lastTable + '">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
          const room = document.getElementById('swal-input1').value;
          const table = document.getElementById('swal-input2').value;
          if (!table) {
            Swal.showValidationMessage('Vui lòng nhập số Bàn phỏng vấn!');
          }
          return { room, table };
        }
      });
      
      if (!formValues) return;
      roomNum = formValues.room;
      tableNum = formValues.table;`;
      
      code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endStr.length);
    }
  }

  // Handle other window.prompts/confirms
  code = code.replace(/window\.confirm\(`Bạn có chắc muốn xoá tài khoản \$\{username\} không\?`\)/g, "await Swal.fire({title: 'Xác nhận xoá', text: `Bạn có chắc muốn xoá tài khoản ${username}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Xoá', cancelButtonText: 'Huỷ'}).then(r => r.isConfirmed)");
  
  // Actually, replacing `if (!window.confirm(...)) return;` directly is better
  code = code.replace(/if \(\!window\.confirm\(`Bạn có chắc muốn xoá tài khoản \$\{username\} không\?`\)\) return;/g, "const confirm = await Swal.fire({title: 'Xác nhận xoá', text: `Bạn có chắc muốn xoá tài khoản ${username}?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Xoá', cancelButtonText: 'Huỷ'});\n    if (!confirm.isConfirmed) return;");

  // AdminView clean data prompt
  let cleanDataRegex = /const password = window\.prompt\("C\?NH BA\?O.*"\);\s*if \(password === null\) return;/;
  let cleanReplacement = `const { value: password } = await Swal.fire({
      title: 'LÀM SẠCH DỮ LIỆU',
      input: 'password',
      inputLabel: 'Nhập mật khẩu để tiếp tục:',
      inputPlaceholder: 'Mật khẩu...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    });
    if (!password) return;`;
  
  // Since encoding is weird, we'll just search by indexOf
  let cdStart = code.indexOf('const password = window.prompt("');
  if (cdStart !== -1) {
    let cdEnd = code.indexOf('if (password === null) return;', cdStart);
    if (cdEnd !== -1) {
      code = code.substring(0, cdStart) + cleanReplacement + code.substring(cdEnd + 'if (password === null) return;'.length);
    }
  }

  // Receptionist check-in prompt
  let checkinStart = code.indexOf('const code = window.prompt("');
  if (checkinStart !== -1) {
    let checkinEnd = code.indexOf('if (!code) return;', checkinStart);
    if (checkinEnd !== -1) {
      let rcptReplacement = `const { value: code } = await Swal.fire({
      title: 'Check-in Ứng viên',
      input: 'text',
      inputLabel: 'Nhập MSSV (hoặc Mã PV) của ứng viên:',
      showCancelButton: true,
      confirmButtonText: 'Check-in',
      cancelButtonText: 'Hủy'
    });
    if (!code) return;`;
      code = code.substring(0, checkinStart) + rcptReplacement + code.substring(checkinEnd + 'if (!code) return;'.length);
    }
  }

  // Interviewer cancel prompt
  let cancelStart = code.indexOf("const confirm = window.confirm('B");
  if (cancelStart !== -1) {
    let cancelEnd = code.indexOf('if (!confirm) return;', cancelStart);
    if (cancelEnd !== -1) {
      let cancelRep = `const confirmResult = await Swal.fire({
        title: 'Xác nhận huỷ',
        text: 'Bạn có chắc chắn muốn huỷ lượt gọi và đưa ứng viên trở về hàng đợi?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Huỷ lượt',
        cancelButtonText: 'Đóng'
      });
      if (!confirmResult.isConfirmed) return;`;
      code = code.substring(0, cancelStart) + cancelRep + code.substring(cancelEnd + 'if (!confirm) return;'.length);
    }
  }

  // Interviewer leave prompt
  let leaveStart = code.indexOf('if (!window.confirm("B');
  if (leaveStart !== -1) {
    let leaveEnd = code.indexOf(')) return;', leaveStart);
    if (leaveEnd !== -1) {
      let leaveRep = `const leaveConfirm = await Swal.fire({
      title: 'Rời bàn',
      text: 'Bạn có chắc chắn muốn rời bàn phỏng vấn? Khi đăng nhập lại bạn sẽ phải chọn lại phòng và bàn.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Rời đi',
      cancelButtonText: 'Huỷ'
    });
    if (!leaveConfirm.isConfirmed) return;`;
      code = code.substring(0, leaveStart) + leaveRep + code.substring(leaveEnd + ')) return;'.length);
    }
  }

  // Add import
  if (!code.includes("import Swal")) {
    code = code.replace("import React", "import Swal from 'sweetalert2';\nimport React");
  }

  fs.writeFileSync(file, code, 'utf-8');
  console.log('Fixed ' + file);
});
