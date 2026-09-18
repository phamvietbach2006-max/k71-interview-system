const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/InterviewerView.jsx');
let c = fs.readFileSync(filePath, 'utf-8');

// B1: Fix fetchBoard string comparison to use trim
c = c.replace(
  `      const candidate = all.find(c => 
        c.assignedTable === String(tableNum) && 
        c.assignedRoom === String(roomNum) &&
        (c.status === 'moving' || c.status === 'interviewing')
      );`,
  `      const candidate = all.find(c => 
        String(c.assignedTable || '').trim() === String(tableNum || '').trim() && 
        String(c.assignedRoom || '').trim() === String(roomNum || '').trim() &&
        (c.status === 'moving' || c.status === 'interviewing')
      );`
);

// L1: Fix useEffect dependency array to include 'user'
c = c.replace(
  `  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [navigate]);`,
  `  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);`
);

// M3: Fix submitEvaluation to check response before resetting UI
c = c.replace(
  `  const submitEvaluation = async () => {
    if (!currentCandidate) return;
    const data = {
      interviewCode: currentCandidate.interviewCode,
      department: currentCandidate.department || user.department,
      interviewerUsername: user.username,
      attitudeScore: attitude,
      skillScore: skill,
      problemSolvingScore: problemSolving,
      notes,
      result
    };
    
    await fetch('/api/evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    setAttitude(5); setSkill(5); setProblemSolving(5); setNotes(''); setResult('Đạt');
    setCurrentCandidate(null);
  };`,
  `  const submitEvaluation = async () => {
    if (!currentCandidate) return;
    
    const confirmed = await Swal.fire({
      title: 'Xác nhận lưu đánh giá',
      text: \`Bạn có chắc muốn lưu kết quả phỏng vấn cho ứng viên \${currentCandidate.interviewCode}?\`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Kiểm tra lại'
    });
    if (!confirmed.isConfirmed) return;
    
    const payload = {
      interviewCode: currentCandidate.interviewCode,
      department: currentCandidate.department || user.department,
      interviewerUsername: user.username,
      attitudeScore: attitude,
      skillScore: skill,
      problemSolvingScore: problemSolving,
      notes,
      result
    };
    
    try {
      const res = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setAttitude(5); setSkill(5); setProblemSolving(5); setNotes(''); setResult('Đạt');
        setCurrentCandidate(null);
        Swal.fire({ title: 'Đã lưu!', text: 'Kết quả phỏng vấn đã được ghi lại.', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        Swal.fire({ title: 'Lỗi!', text: data.error || 'Không thể lưu đánh giá. Vui lòng thử lại.', icon: 'error' });
      }
    } catch (err) {
      Swal.fire({ title: 'Lỗi mạng!', text: 'Mất kết nối. Vui lòng kiểm tra internet và thử lại.', icon: 'error' });
    }
  };`
);

fs.writeFileSync(filePath, c, 'utf-8');
console.log('InterviewerView.jsx patched!');

const result = fs.readFileSync(filePath, 'utf-8');
const hasB1 = result.includes("String(c.assignedTable || '').trim()");
const hasL1 = result.includes('[user, navigate]');
const hasM3 = result.includes('Xác nhận lưu đánh giá');
console.log('✓ B1 trim fix:', hasB1);
console.log('✓ L1 dependency fix:', hasL1);
console.log('✓ M3 confirm dialog:', hasM3);
