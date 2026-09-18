const fs = require('fs');
const path = require('path');

// === Fix CandidateView.jsx B2: null guard ===
const candidatePath = path.join(__dirname, '../frontend/src/pages/CandidateView.jsx');
let cv = fs.readFileSync(candidatePath, 'utf-8');

cv = cv.replace(
  `    socketRef.current.on('candidate_assigned', (data) => {
      if (data.candidate.interviewCode === stored.interviewCode && data.candidate.department === stored.department) {
        setStatus('moving');
        setHasAcked(false);
        setAssignedTable(data.tableNumber);
        setAssignedRoom(data.roomNumber);
        playAlertSound();
        startFlashing();
      }
    });`,
  `    socketRef.current.on('candidate_assigned', (data) => {
      // B2 fix: guard against stored being null
      if (!stored) return;
      if (data.candidate.interviewCode === stored.interviewCode && data.candidate.department === stored.department) {
        setStatus('moving');
        setHasAcked(false);
        setAssignedTable(data.tableNumber);
        setAssignedRoom(data.roomNumber);
        playAlertSound();
        startFlashing();
      }
    });`
);

fs.writeFileSync(candidatePath, cv, 'utf-8');
console.log('CandidateView.jsx patched!');
const cvResult = fs.readFileSync(candidatePath, 'utf-8');
console.log('✓ B2 null guard:', cvResult.includes('if (!stored) return;'));

// === Fix ChatWidget.jsx M2: handle 403 error ===
const chatPath = path.join(__dirname, '../frontend/src/components/ChatWidget.jsx');
let cw = fs.readFileSync(chatPath, 'utf-8');

cw = cw.replace(
  `  const sendMessage = async (e, quickResponse = null) => {
    if (e) e.preventDefault();
    const content = quickResponse || inputMsg.trim();
    if (!content) return;
    
    const receiverId = activeTab === 'group' ? groupRoom : activeTab;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: currentUser.username,
        senderRole: currentUser.role,
        receiver: receiverId,
        content: content
      })
    });
    setInputMsg('');
  };`,
  `  const sendMessage = async (e, quickResponse = null) => {
    if (e) e.preventDefault();
    const content = quickResponse || inputMsg.trim();
    if (!content) return;
    
    const receiverId = activeTab === 'group' ? groupRoom : activeTab;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser.username,
          senderRole: currentUser.role,
          receiver: receiverId,
          content: content
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        // M2 fix: show error if server rejects (e.g. 403 non-admin in group chat)
        if (res.status === 403) {
          alert('Chỉ Admin mới được gửi tin nhắn vào nhóm chung.');
        } else {
          console.error('Message send failed:', errData);
        }
        return;
      }
      setInputMsg('');
    } catch (err) {
      console.error('Network error sending message:', err);
    }
  };`
);

fs.writeFileSync(chatPath, cw, 'utf-8');
console.log('ChatWidget.jsx patched!');
const cwResult = fs.readFileSync(chatPath, 'utf-8');
console.log('✓ M2 error handling:', cwResult.includes('Chỉ Admin mới được gửi'));
