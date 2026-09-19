const fs = require('fs');
const path = require('path');

const boardPath = path.join(__dirname, '../frontend/src/pages/Board.jsx');
let b = fs.readFileSync(boardPath, 'utf-8');

// 1. Add props: isAdmin, onRemoveCandidate
b = b.replace(
  'export default function Board({ hideHeader, department }) {',
  'export default function Board({ hideHeader, department, isAdmin, onRemoveCandidate }) {'
);

// 2. Add context menu state after the boardData state
b = b.replace(
  `const [boardData, setBoardData] = useState({ waiting: [], interviewing: [], completed: [] });`,
  `const [boardData, setBoardData] = useState({ waiting: [], interviewing: [], completed: [] });
  const [contextMenu, setContextMenu] = useState(null); // { x, y, candidate }

  // Close context menu on any click
  React.useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);`
);

// 3. Replace the waiting candidate card to add right-click handler
const oldCard = `              ) : boardData.waiting.map(c => (
                <div key={c.interviewCode} className={\`relative p-5 rounded-2xl transition-all duration-500 \${c.status === 'moving' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg shadow-orange-500/20 scale-[1.02] z-10' : 'bg-white/80 border border-white shadow-sm hover:shadow-md'}\`}>`;

const newCard = `              ) : boardData.waiting.map(c => (
                <div key={c.interviewCode}
                  className={\`relative p-5 rounded-2xl transition-all duration-500 \${c.status === 'moving' ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-lg shadow-orange-500/20 scale-[1.02] z-10' : 'bg-white/80 border border-white shadow-sm hover:shadow-md'}\${isAdmin ? ' cursor-context-menu' : ''}\`}
                  onContextMenu={isAdmin ? (e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, candidate: c }); } : undefined}
                >`;

b = b.replace(oldCard, newCard);

// 4. Add the context menu popup JSX before the closing </div> of the main return
const oldEnd = `    </div>
  );
}`;

const newEnd = `    </div>

      {/* Admin Context Menu */}
      {isAdmin && contextMenu && (
        <div
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 py-1 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
            {contextMenu.candidate.applicationData?.['Họ và tên'] || contextMenu.candidate.interviewCode}
          </div>
          <button
            onClick={() => {
              if (onRemoveCandidate) onRemoveCandidate(contextMenu.candidate);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <span>🗑️</span> Xóa khỏi hàng chờ
          </button>
        </div>
      )}
    </div>
  );
}`;

b = b.replace(oldEnd, newEnd);

fs.writeFileSync(boardPath, b, 'utf-8');
console.log('Board.jsx patched with right-click context menu.');


// 5. Patch AdminView to pass isAdmin and handle removal
const adminPath = path.join(__dirname, '../frontend/src/pages/AdminView.jsx');
let a = fs.readFileSync(adminPath, 'utf-8');

// Add handleRemoveFromQueue function before handleAddCandidate
const removeFunc = `
  const handleRemoveFromQueue = async (candidate) => {
    const { value: password } = await Swal.fire({
      title: 'Xác nhận xóa khỏi hàng chờ',
      text: \`Xóa check-in của: \${candidate.applicationData?.['Họ và tên'] || candidate.interviewCode}?\`,
      input: 'password',
      inputLabel: 'Nhập mật khẩu để xác nhận:',
      inputPlaceholder: 'Mật khẩu...',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Hủy',
    });
    if (!password) return;
    if (password !== 'Abc@123') {
      return Swal.fire('Sai mật khẩu!', 'Không thể thực hiện thao tác này.', 'error');
    }
    try {
      const res = await fetch('/api/candidates/reset-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewCode: candidate.interviewCode, department: candidate.department })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã xóa check-in. Ứng viên có thể check-in lại từ đầu.');
        fetchBoard();
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    }
  };

`;

// Insert before handleAddCandidate
a = a.replace(
  '  const handleAddCandidate = async (e) => {',
  removeFunc + '  const handleAddCandidate = async (e) => {'
);

// 6. Pass isAdmin and onRemoveCandidate to Board component
a = a.replace(
  '<Board hideHeader={true} department={viewDepartment} />',
  '<Board hideHeader={true} department={viewDepartment} isAdmin={true} onRemoveCandidate={handleRemoveFromQueue} />'
);

fs.writeFileSync(adminPath, a, 'utf-8');
console.log('AdminView.jsx patched with remove from queue handler.');
