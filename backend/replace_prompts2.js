const fs = require('fs');
const replacement = `if (targetRole === 'interviewer') {
      let lastRoom = localStorage.getItem('lastRoom') || '';
      let lastTable = localStorage.getItem('lastTable') || '';
      
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
      tableNum = formValues.table;
    }`;

const files = ['frontend/src/pages/AdminView.jsx', 'frontend/src/pages/InterviewerView.jsx', 'frontend/src/pages/ReceptionistView.jsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  const regex = /if\s*\(targetRole\s*===\s*'interviewer'\)\s*\{\s*let\s+lastRoom\s*=\s*localStorage\.getItem\('lastRoom'\)\s*\|\|\s*'';\s*let\s+lastTable\s*=\s*localStorage\.getItem\('lastTable'\)\s*\|\|\s*'';\s*roomNum\s*=\s*window\.prompt\([^)]+\);\s*if\s*\(roomNum\s*===\s*null\)\s*return;\s*\/\/\s*User\s*cancelled\s*tableNum\s*=\s*window\.prompt\([^)]+\);\s*if\s*\(!tableNum\)\s*return;\s*\/\/\s*User\s*cancelled\s*or\s*left\s*empty\s*\}/;
  
  if (regex.test(code)) {
    code = code.replace(regex, replacement);
    if (!code.includes("import Swal from 'sweetalert2'")) {
      code = code.replace("import React", "import Swal from 'sweetalert2';\nimport React");
    }
    fs.writeFileSync(file, code, 'utf-8');
    console.log('Fixed ' + file);
  } else {
    console.log('Failed to match ' + file);
  }
});
