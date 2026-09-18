const fs = require('fs');

const files = [
  'frontend/src/pages/AdminView.jsx',
  'frontend/src/pages/InterviewerView.jsx',
  'frontend/src/pages/ReceptionistView.jsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf-8');
  code = code.replace("import { LogOut, useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';");
  
  if (!code.includes("import { LogOut, ")) {
    code = code.replace("import { LayoutDashboard", "import { LogOut, LayoutDashboard");
    code = code.replace("import { LogIn", "import { LogOut, LogIn");
    code = code.replace("import { UserCircle", "import { LogOut, UserCircle");
    code = code.replace("import { CheckCircle2", "import { LogOut, CheckCircle2");
  }

  // InterviewerView might have a different lucide-react import
  if (f.includes('InterviewerView')) {
    code = code.replace("import { CheckCircle2", "import { LogOut, CheckCircle2");
  }

  // ReceptionistView might have a different lucide-react import
  if (f.includes('ReceptionistView')) {
    code = code.replace("import { CheckCircle2", "import { LogOut, CheckCircle2");
  }

  fs.writeFileSync(f, code, 'utf-8');
  console.log('Fixed imports in ' + f);
});
