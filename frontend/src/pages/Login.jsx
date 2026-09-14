import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogIn, ArrowRight, UserCheck, LayoutDashboard, Hash, Monitor, User } from 'lucide-react';
import MacBackground from '../components/MacBackground';

export default function Login() {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [tempUser, setTempUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Step 1: Verify Code (MSSV/PVxxx)
    if (step === 1) {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.role === 'candidate') {
          localStorage.setItem('user', JSON.stringify({ interviewCode: data.interviewCode, role: 'candidate' }));
          navigate('/candidate');
        } else if (data.role === 'interviewer') {
          setTempUser(data);
          setStep(2); // Ask for Table Number
        } else {
          // Admin / Receptionist
          localStorage.setItem('user', JSON.stringify({ username: data.username, fullName: data.fullName, role: data.role }));
          navigate('/admin');
        }
      } else {
        alert(data.message || "Đăng nhập thất bại!");
      }
    } 
    // Step 2: Submit Table Number for Interviewer
    else if (step === 2) {
      if (!tableNumber.trim()) {
        alert("Vui lòng nhập số bàn!");
        return;
      }
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), tableNumber: tableNumber.trim() })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify({ 
          username: data.username, 
          fullName: data.fullName,
          role: data.role, 
          tableNumber: data.tableNumber,
          autoAssign: data.autoAssign
        }));
        navigate('/interviewer');
      } else {
        alert(data.message || "Lỗi khi xác nhận bàn!");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
      <MacBackground />

      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/50 z-10 animate-fade-in-up">
        <div className="flex justify-center mb-8 relative">
          <img src="/assets/title_k71.png" alt="Tuyển Thành Viên Ban Tổ Chức - Kiểm Tra" className="w-full drop-shadow-lg transform hover:scale-105 transition-transform" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {step === 1 && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                MSSV (Ứng viên) / Mã nhân sự <span className="text-blue-500">*</span>
              </label>
              <div className="relative group animate-fade-in-up animation-delay-200">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text" 
                required 
                placeholder="Nhập MSSV (Ứng viên) hoặc Mã nhân sự" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Xin chào {tempUser?.fullName || tempUser?.username}, bạn phụ trách bàn số mấy? <span className="text-blue-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Hash size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Nhập số bàn (VD: 1, 2...)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                  autoFocus
                />
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm font-semibold text-blue-500 hover:text-blue-700 mt-2 block ml-1"
              >
                &larr; Quay lại
              </button>
            </div>
          )}
          
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 mt-8 rounded-2xl font-black text-lg shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all">
            <LogIn size={20} /> {step === 1 ? 'TIẾP TỤC' : 'XÁC NHẬN VÀO BÀN'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
          <button onClick={() => navigate('/tv')} className="group flex items-center justify-center gap-2 w-full text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 py-3 rounded-xl">
            <Monitor size={18} /> Chế độ Trình chiếu TV <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
