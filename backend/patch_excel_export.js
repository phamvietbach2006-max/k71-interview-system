const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let a = fs.readFileSync(adminPath, 'utf-8');

// 1. Import XLSX
if (!a.includes("import * as XLSX from 'xlsx';")) {
  a = a.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport * as XLSX from 'xlsx';");
}

// 2. Replace exportCSV
const oldExport = `  const exportCSV = () => {
    if (filteredEvaluations.length === 0) return;
    
    const headers = ['Ứng viên', 'Người PV', 'Thái độ', 'Kỹ năng', 'Xử lý TH', 'Ghi chú', 'Kết quả'];
    const rows = filteredEvaluations.map(e => [
      \`"\${e.candidateName || e.interviewCode}"\`, \`"\${e.interviewerName || e.interviewerUsername}"\`, e.attitudeScore, e.skillScore, e.problemSolvingScore, \`"\${e.notes || ''}"\`, e.result
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\\n' 
      + rows.map(e => e.join(',')).join('\\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`Danh_gia_phong_van_\${viewDepartment}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

const newExport = `  const exportToExcel = () => {
    if (filteredEvaluations.length === 0) return toast.error('Không có dữ liệu để xuất');
    
    const dataToExport = filteredEvaluations.map((e, index) => {
      const avg = ((e.attitudeScore + e.skillScore + e.problemSolvingScore) / 3).toFixed(1);
      return {
        'STT': index + 1,
        'MSSV / Tên Ứng viên': e.candidateName || e.interviewCode,
        'Người Phỏng vấn': e.interviewerName || e.interviewerUsername,
        'Thái độ & Tác phong': e.attitudeScore,
        'Kỹ năng chuyên môn': e.skillScore,
        'Xử lý tình huống': e.problemSolvingScore,
        'Điểm Trung bình': parseFloat(avg),
        'Kết quả': e.result,
        'Ghi chú / Nhận xét': e.notes || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Auto-size columns
    const wscols = [
      { wch: 5 }, // STT
      { wch: 25 }, // Candidate
      { wch: 25 }, // Interviewer
      { wch: 20 }, // Attitude
      { wch: 20 }, // Skill
      { wch: 20 }, // Problem
      { wch: 15 }, // Avg
      { wch: 15 }, // Result
      { wch: 50 }, // Notes
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KetQuaPhongVan");
    
    XLSX.writeFile(workbook, \`Ket_Qua_Phong_Van_\${viewDepartment}.xlsx\`);
    toast.success('Đã xuất file Excel thành công!');
  };`;

// Use regex because of encoding issues
const exportRegex = /const exportCSV = \(\) => \{[\s\S]*?document\.body\.removeChild\(link\);\s*\};/;
if (exportRegex.test(a)) {
  a = a.replace(exportRegex, newExport);
} else {
  console.log("Could not find exportCSV");
}

// 3. Replace the button calling exportCSV
a = a.replace(/onClick=\{exportCSV\}/g, "onClick={exportToExcel}");
a = a.replace(/> Xuất Excel \(CSV\)/g, "> Xuất Excel");

fs.writeFileSync(adminPath, a, 'utf-8');
console.log("AdminView export Excel patched.");
