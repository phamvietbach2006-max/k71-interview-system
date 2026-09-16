const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Candidate = require('./models/Candidate');
const User = require('./models/User');
const Evaluation = require('./models/Evaluation');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tckt_super_secret_key';

const authMiddleware = async (req, res, next) => {
  // Allow public/read-only routes without token
  if (req.path === '/login' || req.path === '/tv-board' || req.path === '/board') return next();
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // For sensitive Admin routes, check DB for live roles and hardcoded names
    if (req.path.startsWith('/admin')) {
       const dbUser = await User.findById(req.user.id);
       const isAdmin = dbUser && (
         dbUser.role === 'admin' || 
         (dbUser.roles && dbUser.roles.includes('admin')) || 
         dbUser.fullName === 'Phạm Việt Bách' || 
         dbUser.username === 'Phạm Việt Bách'
       );
       if (!isAdmin) {
         return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
       }
    }
    
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
app.use('/api', authMiddleware);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interview';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Auto assignment logic
const assignCandidates = async () => {
  try {
    const availableInterviewers = await User.find({ 
      role: 'interviewer', 
      status: 'active', 
      roomNumber: { $ne: null },
      tableNumber: { $ne: null },
      autoAssign: { $ne: false } // only assign if autoAssign is true
    });
    if (availableInterviewers.length === 0) return;

    for (let interviewer of availableInterviewers) {
      // Concurrency check: Ensure no candidate is currently moving or interviewing at this room/table
      const busyCandidate = await Candidate.findOne({
        assignedRoom: interviewer.roomNumber,
        assignedTable: interviewer.tableNumber,
        status: { $in: ['moving', 'interviewing'] }
      });

      if (busyCandidate) {
        continue; // Skip this interviewer, the table is busy
      }

      const waitingCandidate = await Candidate.findOne({ status: 'waiting', department: interviewer.department }).sort({ checkInTime: 1 });
      if (waitingCandidate) {
        waitingCandidate.status = 'moving';
        waitingCandidate.assignedRoom = interviewer.roomNumber;
        waitingCandidate.assignedTable = interviewer.tableNumber;
        await waitingCandidate.save();

        interviewer.status = 'interviewing';
        await interviewer.save();

        io.emit('candidate_assigned', { candidate: waitingCandidate, roomNumber: interviewer.roomNumber, tableNumber: interviewer.tableNumber });
        io.emit('board_update');
      }
    }
  } catch (err) {
    console.error('Error assigning candidates:', err);
  }
};

setInterval(assignCandidates, 3000); // Check every 3 seconds

const onlineSockets = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  let socketUsername = null;

  socket.on('user_online', (username) => {
    socketUsername = username;
    onlineSockets.set(socket.id, username);
    io.emit('online_users', Array.from(new Set(onlineSockets.values())));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socketUsername) {
      onlineSockets.delete(socket.id);
      io.emit('online_users', Array.from(new Set(onlineSockets.values())));
    }
  });

  // Candidate checks in
  socket.on('candidate_checkin', async (data) => {
    try {
      if (!data.interviewCode) return;
      let query = { interviewCode: data.interviewCode };
      if (data.department) query.department = data.department;
      
      let candidate = await Candidate.findOne(query);
      if (!candidate) {
        candidate = new Candidate({ interviewCode: data.interviewCode, department: data.department || 'TCKT' });
      }
      if (candidate.status === 'active' || !candidate.status) {
        candidate.status = 'waiting';
        candidate.checkInTime = new Date();
        await candidate.save();
        io.emit('board_update');
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Candidate acknowledges moving
  socket.on('candidate_moving_ack', async (data) => {
    // Just a signal if needed
  });

  // Interviewer confirms candidate arrived
  socket.on('interviewer_confirm_presence', async (data) => {
    try {
      let query = { interviewCode: data.interviewCode };
      if (data.department) query.department = data.department;
      const candidate = await Candidate.findOne(query);
      if (candidate && candidate.status === 'moving') {
        candidate.status = 'interviewing';
        await candidate.save();
        io.emit('board_update');
      }
    } catch (err) {
      console.error(err);
    }
  });
});

// Unified Login API
app.post('/api/login', async (req, res) => {
  let { code, tableNumber, roomNumber, department } = req.body;
  if (code) code = code.trim().toUpperCase(); 
  
  try {
    // 1. Check if Candidate
    let candidates = await Candidate.find({ interviewCode: code });
    if (candidates.length > 0) {
      if (candidates.length === 1) {
        const token = jwt.sign({ id: candidates[0]._id, role: 'candidate', interviewCode: candidates[0].interviewCode }, JWT_SECRET, { expiresIn: '12h' });
        return res.json({ success: true, role: 'candidate', interviewCode: candidates[0].interviewCode, department: candidates[0].department, applicationData: candidates[0].applicationData, token });
      } else {
        if (!department) {
          return res.json({ success: true, requireDepartment: true, departments: candidates.map(c => c.department) });
        }
        let selectedCand = candidates.find(c => c.department === department);
        if (selectedCand) {
          const token = jwt.sign({ id: selectedCand._id, role: 'candidate', interviewCode: selectedCand.interviewCode }, JWT_SECRET, { expiresIn: '12h' });
          return res.json({ success: true, role: 'candidate', interviewCode: selectedCand.interviewCode, department: selectedCand.department, applicationData: selectedCand.applicationData, token });
        }
      }
    }

    // 2. Check if Staff (case-insensitive)
    const escapedCode = code.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    let user = await User.findOne({ username: { $regex: new RegExp(`^${escapedCode}$`, 'i') } });
    if (user) {
      if (user.role === 'interviewer') {
        if (tableNumber) user.tableNumber = tableNumber;
        if (roomNumber) user.roomNumber = roomNumber;
        user.status = 'active';
        await user.save();
        io.emit('staff_update');
      }
      
      const token = jwt.sign({ id: user._id, role: user.role, roles: user.roles, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({ 
        success: true, 
        role: user.role, 
        username: user.username,
        fullName: user.fullName,
        department: user.department,
        roles: user.roles,
        tableNumber: user.tableNumber,
        roomNumber: user.roomNumber,
        autoAssign: user.autoAssign,
        token
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid code or user not found' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/board', async (req, res) => {
  const { department } = req.query;
  const filter = department ? { department } : {};
  const waiting = await Candidate.find({ status: 'waiting', ...filter }).sort({ checkInTime: 1 });
  const moving = await Candidate.find({ status: 'moving', ...filter });
  const interviewing = await Candidate.find({ status: 'interviewing', ...filter });
  const completed = await Candidate.find({ status: 'completed', ...filter });
  res.json({ waiting, moving, interviewing, completed });
});

app.get('/api/tv-board', async (req, res) => {
  const fields = {
    interviewCode: 1,
    status: 1,
    department: 1,
    assignedRoom: 1,
    assignedTable: 1,
    'applicationData.Họ và tên': 1,
    checkInTime: 1
  };
  const waiting = await Candidate.find({ status: 'waiting' }).select(fields).sort({ checkInTime: 1 }).lean();
  const moving = await Candidate.find({ status: 'moving' }).select(fields).lean();
  const interviewing = await Candidate.find({ status: 'interviewing' }).select(fields).lean();
  res.json({ waiting, moving, interviewing });
});

app.post('/api/evaluation', async (req, res) => {
  const { interviewCode, department, interviewerUsername, attitudeScore, skillScore, problemSolvingScore, notes, result } = req.body;
  try {
    const evaluation = new Evaluation({
      interviewCode, department, interviewerUsername, attitudeScore, skillScore, problemSolvingScore, notes, result
    });
    await evaluation.save();

    await Candidate.updateOne(
      { interviewCode, department }, 
      { $set: { status: 'completed', interviewEndTime: new Date() } }
    );

    await User.updateOne(
      { username: interviewerUsername },
      { $set: { status: 'active' } }
    );

    io.emit('board_update');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staff/leave', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      user.tableNumber = null;
      user.roomNumber = null;
      user.status = 'active';
      await user.save();
      io.emit('staff_update');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff/status', async (req, res) => {
  const { username, status } = req.body; // status: active or break
  try {
    const user = await User.findOne({ username });
    if (user) {
      user.status = status;
      await user.save();
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.post('/api/admin/clean-data', async (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_CLEAN_PASSWORD || 'Việt Bách đẹp chai vkl';
  if (password !== expectedPassword) {
    return res.status(401).json({ success: false, message: 'Sai mật khẩu!' });
  }
  try {
    await Evaluation.deleteMany({});
    await Candidate.updateMany({}, {
      $set: { 
        status: 'active', 
        assignedRoom: null,
        assignedTable: null,
        checkInTime: null,
        interviewEndTime: null
      }
    });
    await User.updateMany({ role: 'interviewer' }, {
      $set: { status: 'active' }
    });
    await Message.deleteMany({});
    io.emit('board_update');
    io.emit('chat_history', []);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const cands = await Candidate.find().sort({ checkInTime: -1 }).lean();
    res.json(cands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/evaluations', async (req, res) => {
  try {
    const evals = await Evaluation.find().sort({ createdAt: -1 }).lean();
    
    // Fetch all candidates and users for quick lookup
    const candidates = await Candidate.find().lean();
    const users = await User.find().lean();
    
    const candidateMap = {};
    candidates.forEach(c => candidateMap[c.interviewCode] = c.applicationData?.['Họ và tên'] || c.interviewCode);
    
    const userMap = {};
    users.forEach(u => userMap[u.username] = u.fullName || u.username);

    const enrichedEvals = evals.map(e => ({
      ...e,
      candidateName: candidateMap[e.interviewCode] || e.interviewCode,
      interviewerName: userMap[e.interviewerUsername] || e.interviewerUsername
    }));

    res.json(enrichedEvals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chat APIs
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await User.find({ status: { $ne: null } }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sender, senderRole, receiver, content } = req.body;
    
    // Group chat requires admin privileges
    if (receiver === 'group') {
      const user = await User.findOne({ username: sender });
      const isAdmin = user && (
        user.role === 'admin' || 
        (user.roles && user.roles.includes('admin')) || 
        user.fullName === 'Phạm Việt Bách' || 
        user.username === 'Phạm Việt Bách'
      );
      if (!isAdmin) {
        return res.status(403).json({ error: 'Chỉ Admin mới có quyền gửi thông báo chung!' });
      }
    }

    const msg = new Message({ sender, senderRole, receiver, content });
    await msg.save();
    io.emit('new_message', msg);
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages/read', async (req, res) => {
  try {
    const { username, receiver } = req.body; // who is reading, and what chat they are reading (sender username or 'group')
    let filter = {};
    if (receiver === 'group') {
      filter = { receiver: 'group' };
    } else {
      filter = { sender: receiver, receiver: username };
    }
    
    await Message.updateMany(
      { ...filter, readBy: { $ne: username } },
      { $push: { readBy: username } }
    );
    io.emit('messages_read', { reader: username, receiver });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// New APIs for Custom Workflow
// ----------------------------------------------------

app.post('/api/interviewer/settings', async (req, res) => {
  const { username, autoAssign } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      user.autoAssign = autoAssign;
      await user.save();
      res.json({ success: true, autoAssign: user.autoAssign });
    } else {
      res.status(404).json({ success: false });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/interviewer/cancel', async (req, res) => {
  const { username, interviewCode } = req.body;
  try {
    const interviewer = await User.findOne({ username });
    if (!interviewer) return res.status(400).json({ success: false, message: 'Invalid interviewer' });

    const candidate = await Candidate.findOneAndUpdate(
      { 
        interviewCode,
        department: interviewer.department,
        status: { $in: ['moving', 'interviewing'] } 
      },
      { 
        $set: { 
          status: 'waiting', 
          assignedTable: null, 
          assignedRoom: null, 
          checkInTime: new Date(0) 
        } 
      },
      { new: true }
    );
    if (!candidate) return res.status(400).json({ success: false, message: 'Ứng viên không trong trạng thái đang gọi/phỏng vấn' });

    await User.updateOne({ _id: interviewer._id }, { status: 'active' });

    io.emit('board_update');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/interviewer/call', async (req, res) => {
  const { username, interviewCode } = req.body;
  try {
    const interviewer = await User.findOne({ username, role: 'interviewer', status: 'active' });
    if (!interviewer) return res.status(400).json({ success: false, message: 'Interviewer not ready' });

    const busyCandidate = await Candidate.findOne({
      assignedRoom: interviewer.roomNumber,
      assignedTable: interviewer.tableNumber,
      status: { $in: ['moving', 'interviewing'] }
    });
    if (busyCandidate) return res.status(400).json({ success: false, message: 'Bàn này đang có người phỏng vấn!' });

    const candidate = await Candidate.findOneAndUpdate(
      { interviewCode, status: 'waiting', department: interviewer.department },
      { $set: { status: 'moving', assignedRoom: interviewer.roomNumber, assignedTable: interviewer.tableNumber } },
      { new: true }
    );
    if (!candidate) return res.status(400).json({ success: false, message: 'Candidate no longer available in your department' });

    await User.updateOne({ _id: interviewer._id }, { status: 'interviewing' });

    io.emit('candidate_assigned', { candidate, roomNumber: interviewer.roomNumber, tableNumber: interviewer.tableNumber });
    io.emit('board_update');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staff/switch-role', async (req, res) => {
  const { username, targetRole, tableNumber, roomNumber } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Safety check using roles
    const hasAdmin = user.role === 'admin' || (user.roles && user.roles.includes('admin'));
    if (!hasAdmin) {
      return res.status(403).json({ success: false, message: 'Not allowed to switch roles' });
    }

    user.role = targetRole;
    if (targetRole === 'interviewer') {
      if (tableNumber) user.tableNumber = tableNumber;
      if (roomNumber) user.roomNumber = roomNumber;
    }
    await user.save();
    const newToken = jwt.sign({ id: user._id, role: user.role, roles: user.roles, username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, role: user.role, tableNumber: user.tableNumber, roomNumber: user.roomNumber, token: newToken });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get('/api/users', async (req, res) => {
  const users = await User.find().lean();
  res.json(users);
});

app.post('/api/users/update', async (req, res) => {
  const { username, roles, department } = req.body;
  const u = await User.findOne({ username });
  if (u) {
    if (roles) {
      u.roles = roles;
      if (roles.includes('admin')) u.role = 'admin';
      else if (roles.includes('receptionist')) u.role = 'receptionist';
      else if (roles.includes('interviewer')) u.role = 'interviewer';
    }
    if (department) u.department = department;
    await u.save();
  }
  res.json({ success: true });
});

app.post('/api/users/add', async (req, res) => {
  try {
    const { username, fullName, department, roles } = req.body;
    if (!username) return res.status(400).json({ error: "Thiếu username" });
    
    let u = await User.findOne({ username });
    if (u) return res.status(400).json({ error: "Tài khoản đã tồn tại" });
    
    u = new User({
      username,
      fullName: fullName || username,
      department: department || "TCKT",
      roles: roles || ["interviewer"],
      role: (roles && roles.length > 0) ? roles[0] : "interviewer"
    });
    await u.save();
    res.json({ success: true, user: u });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (username.toLowerCase().includes("admin") || username.toLowerCase().includes("bach") || username === "Phạm Việt Bách") {
      return res.status(400).json({ error: "Không thể xóa Super Admin" });
    }
    await User.deleteOne({ username });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Serve static frontend files
const buildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(buildPath));

app.post('/api/candidates', async (req, res) => {
  try {
    const { interviewCode, fullName, department } = req.body;
    if (!interviewCode) return res.status(400).json({ error: "Thiếu Mã Ứng Viên" });
    
    let candidate = await Candidate.findOne({ interviewCode });
    if (candidate) return res.status(400).json({ error: "Mã Ứng Viên đã tồn tại" });
    
    candidate = new Candidate({
      interviewCode,
      department: department || "TCKT",
      status: "active",
      applicationData: { "Họ và tên": fullName || "" }
    });
    
    await candidate.save();
    res.json({ success: true, candidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
