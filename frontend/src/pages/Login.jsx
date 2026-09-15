import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogIn, ArrowRight, UserCheck, LayoutDashboard, Hash, Monitor, User } from 'lucide-react';
import MacBackground from '../components/MacBackground';

export default function Login() {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
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
        if (data.requireDepartment) {
          setTempUser({ code: code.trim(), departments: data.departments });
          setStep(1.5);
        } else if (data.role === 'candidate') {
          setTempUser(data);
          setStep(1.75); // Confirmation screen
        } else if (data.role === 'interviewer') {
          setTempUser(data);
          setStep(2); // Ask for Table & Room Number
        } else {
          // Admin / Receptionist
          localStorage.setItem('user', JSON.stringify({ username: data.username, fullName: data.fullName, role: data.role, department: data.department, roles: data.roles, token: data.token }));
          navigate('/admin');
        }
      } else {
        alert(data.message || "Không tìm thấy Mã số này. Vui lòng kiểm tra lại!");
      }
    } 
    // Step 1.5: Select Department for Candidate applying to both
    else if (step === 1.5) {
      if (!selectedDepartment) return alert("Vui lòng chọn Ban!");
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: tempUser.code, department: selectedDepartment })
      });
      const data = await res.json();
      if (data.success && data.role === 'candidate') {
        setTempUser(data);
        setStep(1.75);
      } else {
        alert(data.message || "Đăng nhập thất bại!");
      }
    }
    // Step 1.75: Confirm Candidate Info
    else if (step === 1.75) {
      localStorage.setItem('user', JSON.stringify({ interviewCode: tempUser.interviewCode, role: 'candidate', department: tempUser.department, token: tempUser.token }));
      navigate('/candidate');
    }
    // Step 2: Set Table & Room Number for Interviewer
    else if (step === 2) {
      if (!tableNumber.trim() || !roomNumber.trim()) {
        alert("Vui lòng nhập cả số phòng và số bàn!");
        return;
      }
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), roomNumber: roomNumber.trim(), tableNumber: tableNumber.trim() })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify({ 
          username: data.username, 
          fullName: data.fullName,
          role: data.role, 
          department: data.department,
          roles: data.roles,
          roomNumber: data.roomNumber,
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
    <div className="flex-1 w-full flex flex-col items-center justify-center bg-slate-50 p-4 font-sans relative overflow-x-hidden overflow-y-auto py-8">
      <MacBackground />

      {/* Floating Props from Artboard 1 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img src="/assets/props/prop_19.png" alt="Prop" className="absolute top-[10%] left-[10%] w-24 md:w-32 opacity-80 animate-float-slow" />
        <img src="/assets/props/prop_18.png" alt="Prop" className="absolute top-[15%] right-[15%] w-20 md:w-28 opacity-80 animate-float-fast" />
        <img src="/assets/props/prop_12.png" alt="Prop" className="absolute bottom-[20%] left-[5%] w-24 md:w-32 opacity-90 animate-float-reverse" />
        <img src="/assets/props/prop_11.png" alt="Prop" className="absolute top-[40%] left-[8%] w-12 md:w-16 opacity-70 animate-float-fast" />
        <img src="/assets/props/prop_15.png" alt="Prop" className="absolute top-[30%] right-[8%] w-16 md:w-20 opacity-80 animate-float-slow" />
        <img src="/assets/props/prop_10.png" alt="Prop" className="absolute bottom-[30%] right-[10%] w-14 md:w-18 opacity-75 animate-float-reverse" />
        <img src="/assets/props/prop_9.png" alt="Prop" className="absolute bottom-[10%] left-[20%] w-16 md:w-20 opacity-80 animate-float-slow" />
        <img src="/assets/props/prop_14.png" alt="Prop" className="absolute bottom-[15%] right-[25%] w-16 md:w-24 opacity-85 animate-float-fast" />
        <img src="/assets/props/prop_7.png" alt="Prop" className="absolute top-[50%] left-[3%] w-12 md:w-16 opacity-90 animate-float-slow" />
        <img src="/assets/props/prop_17.png" alt="Prop" className="absolute top-[60%] right-[4%] w-12 md:w-16 opacity-80 animate-float-reverse" />
        <img src="/assets/props/prop_8.png" alt="Prop" className="absolute top-[20%] left-[25%] w-12 opacity-60 animate-float-fast" />
        <img src="/assets/props/prop_16.png" alt="Prop" className="absolute top-[75%] left-[15%] w-14 opacity-75 animate-float-slow" />
      </div>

              {/* Dual Logos */}
        <div className="z-10 flex flex-row items-center justify-center gap-2 md:gap-8 mb-6 md:mb-12 w-full px-4 max-w-2xl">
          <img src="/assets/title_k71.png" alt="Tuyển Thành Viên Ban Tổ Chức - Kiểm Tra" className="w-[45%] md:w-[24rem] lg:w-[32rem] object-contain drop-shadow-2xl transform animate-fade-in-up" />
          <span className="text-3xl md:text-7xl font-black text-white/70 drop-shadow-md animate-fade-in">&amp;</span>
          <img src="/assets/title_bcs.png" alt="Ban Cán sự năm nhất" className="w-[45%] md:w-[24rem] lg:w-[32rem] object-contain drop-shadow-2xl transform animate-fade-in-up animation-delay-100" />
        </div>

      <div className="bg-white/90 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.1)] w-full max-w-md border border-white z-10 animate-fade-in-up mb-12">
        
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

          {step === 1.5 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-sm font-bold text-slate-700 ml-1">
                Bạn đã đăng ký cả 2 Ban. Vui lòng chọn Ban muốn phỏng vấn lúc này: <span className="text-blue-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {tempUser?.departments?.map(dep => (
                  <button 
                    type="button" 
                    key={dep}
                    onClick={() => setSelectedDepartment(dep)}
                    className={`py-3 rounded-xl font-bold border-2 transition-all ${selectedDepartment === dep ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
                  >
                    {dep === 'TCKT' ? 'Ban TCKT' : 'Ban Cán sự'}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-blue-500 hover:text-blue-700 mt-2 block ml-1">&larr; Quay lại</button>
            </div>
          )}

          {step === 1.75 && tempUser && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Xác nhận thông tin</h2>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
                <p className="text-sm"><span className="text-slate-500 font-semibold">MSSV:</span> <span className="font-bold text-slate-800 text-lg ml-2">{tempUser.interviewCode}</span></p>
                <p className="text-sm"><span className="text-slate-500 font-semibold">Họ và tên:</span> <span className="font-bold text-slate-800 text-lg ml-2">{tempUser.applicationData?.['Họ và tên'] || 'Không có dữ liệu'}</span></p>
                <p className="text-sm"><span className="text-slate-500 font-semibold">Ban ứng tuyển:</span> <span className="font-bold text-slate-800 text-lg ml-2">{tempUser.department === 'TCKT' ? 'Ban Tổ chức - Kiểm tra' : 'Ban Cán sự năm nhất'}</span></p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Nhập lại
                </button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                  Xác nhận
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  Xin chào {tempUser?.fullName || tempUser?.username}, bạn phụ trách phòng số mấy? <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Hash size={20} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: 1, 2, 3..." 
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  Và bàn số mấy? <span className="text-blue-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Monitor size={20} />
                  </div>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: 1, 2..." 
                    value={tableNumber} 
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full pl-11 border-2 border-slate-200 rounded-2xl px-4 py-3.5 bg-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
                  />
                </div>
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
          
          {step !== 1.75 && (
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 mt-8 rounded-2xl font-black text-lg shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all">
              <LogIn size={20} /> {step === 1 ? 'TIẾP TỤC' : step === 1.5 ? 'XÁC NHẬN VÀO PHÒNG CHỜ' : 'XÁC NHẬN VÀO BÀN'}
            </button>
          )}
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
