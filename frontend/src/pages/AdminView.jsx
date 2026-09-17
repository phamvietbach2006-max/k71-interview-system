import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Download, Clock, ShieldCheck, FileText, RefreshCw, Hash, Trash2, List } from 'lucide-react';
import io from 'socket.io-client';
import Board from './Board';
import ChatWidget from '../components/ChatWidget';
import MacBackground from '../components/MacBackground';
import MacWindow from '../components/MacWindow';

export default function AdminView() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [boardData, setBoardData] = useState({ waiting: [], interviewing: [], completed: [] });
  const [evaluations, setEvaluations] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('board'); // board, evaluations, users
  const [draftRoles, setDraftRoles] = useState({});
  const [draftDepartments, setDraftDepartments] = useState({});
  const [newUser, setNewUser] = useState({ username: '', fullName: '', department: 'TCKT', roles: ['interviewer'] });
  const [newCandidate, setNewCandidate] = useState({ interviewCode: '', fullName: '', department: 'TCKT' });
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isSuperAdmin = user.role === 'admin' || (user.roles && user.roles.includes('admin')) || user.fullName === 'Phạm Việt Bách' || user.username === 'Phạm Việt Bách';
  const [viewDepartment, setViewDepartment] = useState(user.department || 'TCKT');

  useEffect(() => {
    socketRef.current = io('/');
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    return () => {
      clearInterval(interval);
      socketRef.current.disconnect();
    };
  }, [viewDepartment]);

  useEffect(() => {
    if (activeTab === 'evaluations') {
      fetchEvaluations();
      if (isSuperAdmin) fetchCandidates();
    }
    if (activeTab === 'users' && isSuperAdmin) fetchUsers();
    if (activeTab === 'candidates' && isSuperAdmin) fetchCandidates();
  }, [activeTab]);

  const performSwitchRole = async (rNum, tNum) => {
    if (!tNum || !rNum) return alert('Vui lòng nhập số phòng và số bàn');
    
    const res = await fetch('/api/staff/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, targetRole: 'interviewer', roomNumber: rNum, tableNumber: tNum })
    });
    const data = await res.json();
    if (data.success) {
      const stored = JSON.parse(localStorage.getItem('user'));
      stored.role = 'interviewer';
      stored.roomNumber = rNum;
      stored.tableNumber = tNum;
      if (data.token) stored.token = data.token;
      localStorage.setItem('user', JSON.stringify(stored));
      navigate('/interviewer');
    }
  };

  const switchRole = (e) => {
    e.preventDefault();
    performSwitchRole(roomNumber, tableNumber);
  };

  const handleSwitchToInterviewer = () => {
    const stored = JSON.parse(localStorage.getItem('user')) || {};
    if (stored.tableNumber && stored.roomNumber) {
      performSwitchRole(stored.roomNumber, stored.tableNumber);
    } else {
      setRoomNumber(localStorage.getItem('lastRoomNumber') || '');
      setTableNumber(localStorage.getItem('lastTableNumber') || '');
      setShowTablePrompt(true);
    }
  };

  const fetchBoard = async () => {
    const query = viewDepartment ? `?department=${viewDepartment}` : '';
    const res = await fetch(`/api/board${query}`);
    const data = await res.json();
    setBoardData({
      ...data,
      waiting: [...(data.moving || []), ...(data.waiting || [])]
    });
  };

  const fetchEvaluations = async () => {
    const res = await fetch('/api/evaluations');
    const data = await res.json();
    setEvaluations(data);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsersList(data);
  };

  const fetchCandidates = async () => {
    const res = await fetch('/api/candidates');
    const data = await res.json();
    setCandidates(data);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!newCandidate.interviewCode || !newCandidate.fullName) return alert('Vui lòng điền đủ Mã Ứng Viên và Họ Tên');
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCandidate)
    });
    const data = await res.json();
    if (data.success) {
      alert('Thêm ứng viên thành công!');
      setNewCandidate({ interviewCode: '', fullName: '', department: 'TCKT' });
      fetchCandidates();
    } else {
      alert(data.error || 'Có lỗi xảy ra');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username) return alert('Vui lòng nhập tài khoản');
    try {
      const res = await fetch('/api/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        alert('Đã thêm nhân sự thành công!');
        setNewUser({ username: '', fullName: '', department: 'TCKT', roles: ['interviewer'] });
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  
  const handleRoleToggle = (username, currentRoles, roleToToggle) => {
    const roles = draftRoles[username] || currentRoles || [];
    let newRoles = [...roles];
    if (newRoles.includes(roleToToggle)) {
      newRoles = newRoles.filter(r => r !== roleToToggle);
    } else {
      newRoles.push(roleToToggle);
    }
    setDraftRoles({ ...draftRoles, [username]: newRoles });
  };

  const saveUserChanges = async (username) => {
    const roles = draftRoles[username];
    const dept = draftDepartments[username];
    const payload = { username };
    if (roles !== undefined) payload.roles = roles;
    if (dept !== undefined) payload.department = dept;
    
    await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const newDraftRoles = { ...draftRoles };
    delete newDraftRoles[username];
    setDraftRoles(newDraftRoles);
    
    const newDraftDepts = { ...draftDepartments };
    delete newDraftDepts[username];
    setDraftDepartments(newDraftDepts);
    
    fetchUsers();
    alert("Cập nhật thành công!");
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản ${username} không?`)) return;
    try {
      const res = await fetch(`/api/users/${username}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const updateUserRole = async (username, currentRoles, roleToToggle) => {
    let newRoles = [...(currentRoles || [])];
    if (newRoles.includes(roleToToggle)) {
      newRoles = newRoles.filter(r => r !== roleToToggle);
    } else {
      newRoles.push(roleToToggle);
    }
    
    await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, roles: newRoles })
    });
    fetchUsers();
  };

  const getWaitMinutes = (checkInTime) => {
    if (!checkInTime || new Date(checkInTime).getTime() === 0) return 0;
    return Math.floor((new Date() - new Date(checkInTime)) / 60000);
  };

  const bottleneckCandidates = boardData.waiting.filter(c => getWaitMinutes(c.checkInTime) > 30);

  const handleCleanData = async () => {
    const password = window.prompt("CẢNH BÁO: Hành động này sẽ làm sạch toàn bộ dữ liệu phỏng vấn. Vui lòng nhập mật khẩu:");
    if (password === null) return;
    
    const res = await fetch('/api/admin/clean-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Đã làm sạch dữ liệu thành công!");
      fetchBoard();
      if (activeTab === 'evaluations') fetchEvaluations();
    } else {
      alert("Lỗi: " + data.message);
    }
  };

  const filteredEvaluations = evaluations.filter(e => e.department === viewDepartment || (!e.department && viewDepartment === 'TCKT'));
  const filteredCandidates = candidates.filter(c => c.department === viewDepartment || (!c.department && viewDepartment === 'TCKT'));

  const exportCSV = () => {
    if (filteredEvaluations.length === 0) return;
    
    const headers = ['Ứng viên', 'Người PV', 'Thái độ', 'Kỹ năng', 'Xử lý TH', 'Ghi chú', 'Kết quả'];
    const rows = filteredEvaluations.map(e => [
      `"${e.candidateName || e.interviewCode}"`, `"${e.interviewerName || e.interviewerUsername}"`, e.attitudeScore, e.skillScore, e.problemSolvingScore, `"${e.notes || ''}"`, e.result
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Danh_gia_phong_van_${viewDepartment}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user.username || !isSuperAdmin) return <div className="min-h-screen flex items-center justify-center">Truy cập bị từ chối.</div>;

  const renderUsersTable = (filteredUsers, title) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
      <div className="overflow-x-auto custom-scrollbar pb-4 bg-white/50 rounded-xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b-2 border-slate-200">
              <th className="p-4 font-black tracking-wider uppercase text-sm w-[5%] text-center">STT</th>
              <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Tài Khoản</th>
              <th className="p-4 font-black tracking-wider uppercase text-sm w-[25%]">Họ và Tên</th>
              <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Ban</th>
              <th className="p-4 font-black tracking-wider uppercase text-sm w-auto">Phân Quyền</th>
              <th className="p-4 font-black tracking-wider uppercase text-sm w-[10%] text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, index) => (
              <tr key={u.username} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                <td className="p-4 font-bold text-slate-500 text-center">{index + 1}</td>
                <td className="p-4 font-bold text-slate-800">{u.username}</td>
                <td className="p-4 text-slate-600 font-medium">{u.fullName || ""}</td>
                <td className="p-4">
                  <select 
                    value={u.department || "TCKT"}
                    onChange={(e) => fetch("/api/users/update", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ username: u.username, department: e.target.value }) }).then(fetchUsers)}
                    className="bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="TCKT">TCKT</option>
                    <option value="BCS">BCS</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex gap-4">
                    {["admin", "interviewer", "receptionist"].map(role => (
                      <label key={role} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={u.roles?.includes(role)} 
                          onChange={() => updateUserRole(u.username, u.roles, role)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">{role}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDeleteUser(u.username)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors text-sm">Xóa</button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 italic">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden p-4 md:p-8 font-sans flex flex-col items-center">
      <MacBackground />

      <MacWindow title={`Admin Dashboard - ${user.fullName || user.username}`} className="w-full max-w-[1600px] flex-1" contentClassName="p-0 flex flex-col h-full">
        {/* Navigation Tabs */}
        <div className="bg-slate-800 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md shrink-0">
          <div className="flex items-center gap-4">
            <nav className="flex gap-2 bg-slate-900/50 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('board')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'board' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Users size={18} /> Bảng Tiến Độ
              </button>
              <button 
                onClick={() => setActiveTab('evaluations')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'evaluations' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <FileText size={18} /> Dữ Liệu Đánh Giá
              </button>
              {isSuperAdmin && (
                <>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    <ShieldCheck size={18} /> Quản Lý Nhân Sự
                  </button>
                  <button 
                    onClick={() => setActiveTab('candidates')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'candidates' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    <List size={18} /> Danh Sách Ứng Viên
                  </button>
                </>
              )}
            </nav>

            {isSuperAdmin && (
              <select 
                value={viewDepartment}
                onChange={e => setViewDepartment(e.target.value)}
                className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="TCKT">Ban TCKT</option>
                <option value="BCS">Ban Cán sự</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            {['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'].includes(user.fullName) && (
              <button 
                onClick={handleCleanData}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Trash2 size={16} /> Làm sạch dữ liệu
              </button>
            )}
            {user.roles && user.roles.includes('interviewer') && (
              <button onClick={handleSwitchToInterviewer} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                <RefreshCw size={16} /> Sang Người PV
              </button>
            )}
            {user.roles && user.roles.includes('receptionist') && (
              <button onClick={() => performSwitchToRole('receptionist', '/receptionist')} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2 text-white">
                <RefreshCw size={16} /> Sang Lễ Tân
              </button>
            )}
            
            {activeTab === 'evaluations' && (
              <button onClick={exportCSV} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                <Download size={16} /> Xuất Excel
              </button>
            )}

            <div className="flex items-center gap-2 bg-slate-900/50 px-5 py-2.5 rounded-full text-sm font-bold border border-slate-700/50 text-emerald-400 shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Trực tuyến
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white/40 custom-scrollbar relative">
          {activeTab === 'board' && (
            <div className="flex flex-col xl:flex-row gap-8 h-full">
              {/* Sidebar Alerts */}
              <div className="xl:w-80 flex flex-col gap-6 shrink-0">
                <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border overflow-hidden transition-colors ${bottleneckCandidates.length > 0 ? 'border-red-300' : 'border-slate-200'}`}>
                  <div className={`p-4 flex items-center gap-2 border-b ${bottleneckCandidates.length > 0 ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
                    <AlertTriangle size={20} className={bottleneckCandidates.length > 0 ? 'animate-pulse' : ''} />
                    <h2 className="font-bold uppercase tracking-wider text-sm">Cảnh báo chờ lâu (&gt;30p)</h2>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {bottleneckCandidates.map(c => (
                      <div key={c.interviewCode} className="bg-red-50/80 border border-red-200/50 p-4 rounded-xl flex items-center justify-between shadow-sm">
                        <span className="font-black text-red-900 text-lg">{c.interviewCode}</span>
                        <div className="flex items-center gap-1 text-red-700 font-bold bg-white/60 px-3 py-1 rounded-full text-sm border border-red-100">
                          <Clock size={14} /> {getWaitMinutes(c.checkInTime)}p
                        </div>
                      </div>
                    ))}
                    {bottleneckCandidates.length === 0 && (
                      <div className="text-center text-slate-400 py-6">
                        <ShieldCheck size={40} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Mọi thứ đang hoạt động trơn tru.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 p-5">
                  <h2 className="font-bold text-slate-700 uppercase tracking-wider text-sm mb-4 border-b border-slate-100 pb-2">Thống kê nhanh</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-600 font-medium">Đang chờ:</span>
                      <span className="font-black text-xl text-orange-500">{boardData.waiting.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-600 font-medium">Đang phỏng vấn:</span>
                      <span className="font-black text-xl text-blue-600">{boardData.interviewing.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-600 font-medium">Đã hoàn thành:</span>
                      <span className="font-black text-xl text-emerald-500">{boardData.completed.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Board Area - Embedded with relative positioning */}
              <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white/50 overflow-hidden relative min-h-[70vh]">
                <div className="absolute inset-0 overflow-y-auto">
                  <div className="transform scale-[0.9] origin-top">
                    <Board hideHeader={true} department={viewDepartment} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-8 animate-fade-in-up">
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dữ Liệu Đánh Giá</h2>
                  <p className="text-slate-500 mt-2 font-medium">Danh sách tất cả kết quả đánh giá của ứng viên</p>
                </div>
                <button onClick={exportCSV} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all">
                  <Download size={18} strokeWidth={2.5} /> Xuất Excel (CSV)
                </button>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-700 border-b-2 border-slate-200">
                      <th className="p-4 font-black tracking-wider uppercase text-sm">Ứng Viên</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm">Người PV</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm text-center">Thái độ</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm text-center">Kỹ năng</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm text-center">Xử lý TH</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm text-center">Trung bình</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm text-center">Kết quả</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-1/4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvaluations.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-10 text-center text-slate-500 italic font-medium">Chưa có dữ liệu đánh giá nào.</td>
                      </tr>
                    ) : filteredEvaluations.map((e, index) => {
                      const avg = ((e.attitudeScore + e.skillScore + e.problemSolvingScore) / 3).toFixed(1);
                      return (
                        <tr key={e._id} className={`border-b border-slate-100 hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white/40' : 'bg-transparent'}`}>
                          <td className="p-4 font-black text-blue-700 text-lg">{e.candidateName || e.interviewCode}</td>
                          <td className="p-4 font-medium text-slate-600">{e.interviewerName || e.interviewerUsername}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{e.attitudeScore}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{e.skillScore}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{e.problemSolvingScore}</td>
                          <td className="p-4 text-center">
                            <span className={`px-3 py-1.5 rounded-lg font-black text-sm shadow-sm border ${avg >= 7 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : avg >= 5 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              {avg}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-sm ${e.result === 'Đạt' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' : e.result === 'Không đạt' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' : 'bg-gradient-to-r from-orange-400 to-amber-500 text-white'}`}>
                              {e.result}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 text-sm font-medium">{e.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm text-center">
                  <p className="text-sm font-bold text-blue-600 mb-1 uppercase tracking-wider">Đã phỏng vấn</p>
                  <p className="text-3xl font-black text-blue-800">{filteredEvaluations.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-center">
                  <p className="text-sm font-bold text-slate-600 mb-1 uppercase tracking-wider">Còn lại</p>
                  <p className="text-3xl font-black text-slate-800">{filteredCandidates.length > 0 ? filteredCandidates.filter(c => c.status !== 'completed').length : (boardData.waiting.length + boardData.moving.length + boardData.interviewing.length)}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm text-center">
                  <p className="text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wider">Đạt</p>
                  <p className="text-3xl font-black text-emerald-800">{filteredEvaluations.filter(e => e.result === 'Đạt' || e.result === 'Đạt').length}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm text-center">
                  <p className="text-sm font-bold text-amber-600 mb-1 uppercase tracking-wider">Cân nhắc thêm</p>
                  <p className="text-3xl font-black text-amber-800">{filteredEvaluations.filter(e => e.result === 'Cân nhắc thêm' || e.result === 'Cân nhắc').length}</p>
                </div>
              </div>
              
            </div>
          )}

          {activeTab === 'users' && isSuperAdmin && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-8 animate-fade-in-up">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8 border-b border-slate-100 pb-6">Quản Lý Nhân Sự</h2>
              
              {/* Add New User */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Thêm nhân sự mới</h3>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Tài khoản (để login)</label>
                    <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white" placeholder="vd: phamvietbach" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Họ và Tên</label>
                    <input type="text" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Phạm Việt Bách" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Ban</label>
                    <select value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="TCKT">TCKT</option>
                      <option value="BCS">BCS</option>
                    </select>
                  </div>
                  <button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-colors h-[42px]">Thêm</button>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-4">
                {viewDepartment === 'TCKT' && renderUsersTable(usersList.filter(u => !u.department || u.department === 'TCKT'), 'Danh sách nhân sự: Ban TCKT')}
                {viewDepartment === 'BCS' && renderUsersTable(usersList.filter(u => u.department === 'BCS'), 'Danh sách nhân sự: Ban Cán sự Năm nhất')}
              </div>
            </div>
          )}
          {activeTab === 'candidates' && isSuperAdmin && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50 p-8 animate-fade-in-up">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-8 border-b border-slate-100 pb-6">Danh Sách Ứng Viên</h2>
              
              {/* Add New Candidate */}
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Thêm ứng viên bổ sung</h3>
                <form onSubmit={handleAddCandidate} className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Mã Ứng Viên (MSSV)</label>
                    <input type="text" value={newCandidate.interviewCode} onChange={e => setNewCandidate({...newCandidate, interviewCode: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white" placeholder="vd: 202513118" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-slate-600 mb-1">Họ và Tên</label>
                    <input type="text" value={newCandidate.fullName} onChange={e => setNewCandidate({...newCandidate, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-600 mb-1">Ban</label>
                    <select value={newCandidate.department} onChange={e => setNewCandidate({...newCandidate, department: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="TCKT">TCKT</option>
                      <option value="BCS">BCS</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-colors h-[42px]">Thêm</button>
                </form>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-700 border-b-2 border-slate-200">
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[5%] text-center">STT</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[20%]">Họ và tên</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Mã Ứng Viên</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Ban</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[20%]">Trạng Thái</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Phòng</th>
                      <th className="p-4 font-black tracking-wider uppercase text-sm w-[15%]">Bàn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c, index) => (
                      <tr key={c._id} className="border-b border-slate-100 hover:bg-white/60 transition-colors">
                        <td className="p-4 font-bold text-slate-500 text-center">{index + 1}</td>
                        <td className="p-4 font-bold text-slate-800">{c.applicationData?.['Họ và tên'] || c.applicationData?.['Họ tên'] || '-'}</td>
                        <td className="p-4 font-bold text-slate-800">{c.interviewCode}</td>
                        <td className="p-4 text-slate-600 font-medium">{c.department || "TCKT"}</td>
                        <td className="p-4 font-bold text-slate-600">{
                          c.status === 'active' ? "Chưa điểm danh" :
                          c.status === 'waiting' ? "Đang chờ" :
                          c.status === 'interviewing' ? "Đang phỏng vấn" :
                          c.status === 'moving' ? "Đang di chuyển" :
                          c.status === 'completed' ? "Hoàn thành" : c.status
                        }</td>
                        <td className="p-4 font-bold text-slate-600">{c.assignedRoom || "-"}</td>
                        <td className="p-4 font-bold text-slate-600">{c.assignedTable || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </MacWindow>
      <ChatWidget currentUser={user} />

      {/* Role Switch Modal */}
      {showTablePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={switchRole} className="bg-white/90 backdrop-blur-xl rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-8 border border-white/50 animate-fade-in-up">
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4 text-center">Chuyển sang Người Phỏng Vấn</h3>
            
            <div className="space-y-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Hash size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  autoFocus
                  placeholder="Số phòng (VD: 1, 2...)"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Hash size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Số bàn (VD: 1, 2...)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowTablePrompt(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl transition-colors">Hủy</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all">Xác nhận</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
