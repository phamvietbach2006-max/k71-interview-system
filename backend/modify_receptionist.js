const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ReceptionistView.jsx', 'utf-8');

// 1. Rename component
code = code.replace(/export default function AdminView/, 'export default function ReceptionistView');

// 2. Lock viewDepartment to user.department
code = code.replace(/const \[viewDepartment, setViewDepartment\] = useState\(user.department \|\| 'TCKT'\);/, 
  "const viewDepartment = user.department || 'TCKT';");

// 3. Remove isSuperAdmin logic, evaluations, users
code = code.replace(/const isSuperAdmin =.*?;\n/, '');

// 4. Update TV button logic
// Find the header where the toggle department is, replace it with TV button
const headerPattern = /<div className="flex items-center gap-3">[\s\S]*?<\/select>\n\s*<\/div>/;
const tvButtonHTML = `<div className="flex items-center gap-3">
            <button onClick={() => window.open(\`/tv?department=\${viewDepartment}\`, '_blank')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2">
              <Monitor size={18} /> Mở màn hình TV
            </button>
          </div>`;
code = code.replace(headerPattern, tvButtonHTML);

// 5. Remove "Dữ liệu đánh giá" and "Quản lý nhân sự" from Navigation
const navEvalPattern = /<button onClick=\{\(\) => setActiveTab\('evaluations'\)\}[\s\S]*?Dữ Liệu Đánh Giá\n\s*<\/button>/g;
code = code.replace(navEvalPattern, '');
const navUsersPattern = /\{isSuperAdmin && \([\s\S]*?<button onClick=\{\(\) => setActiveTab\('users'\)\}[\s\S]*?Quản Lý Nhân Sự\n\s*<\/button>\n\s*\)\}/g;
code = code.replace(navUsersPattern, '');

// 6. Remove the actual tabs
const tabEvalPattern = /\{activeTab === 'evaluations' && \([\s\S]*?{activeTab === 'users' && isSuperAdmin && \(/;
code = code.replace(tabEvalPattern, "{activeTab === 'users' && isSuperAdmin && (");

const tabUsersPattern = /\{activeTab === 'users' && isSuperAdmin && \([\s\S]*?<\/div>\n\s*<\/div>\n\s*\)\}/;
code = code.replace(tabUsersPattern, '');

// 7. Remove cleanData button which is for Admin
const cleanDataPattern = /<div className="flex justify-end mt-4">[\s\S]*?Làm Sạch Dữ Liệu[\s\S]*?<\/div>/;
code = code.replace(cleanDataPattern, '');

// Save it back
fs.writeFileSync('frontend/src/pages/ReceptionistView.jsx', code, 'utf-8');
console.log('ReceptionistView modified successfully');
