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
      tableNumber: { $ne: null },
      autoAssign: { $ne: false } // only assign if autoAssign is true
    });
    if (availableInterviewers.length === 0) return;

    for (let interviewer of availableInterviewers) {
      const waitingCandidate = await Candidate.findOne({ status: 'waiting' }).sort({ checkInTime: 1 });
      if (waitingCandidate) {
        waitingCandidate.status = 'moving';
        waitingCandidate.assignedTable = interviewer.tableNumber;
        await waitingCandidate.save();

        interviewer.status = 'interviewing';
        await interviewer.save();

        io.emit('candidate_assigned', { candidate: waitingCandidate, tableNumber: interviewer.tableNumber });
        io.emit('board_update');
      }
    }
  } catch (err) {
    console.error('Error assigning candidates:', err);
  }
};

setInterval(assignCandidates, 3000); // Check every 3 seconds

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Candidate checks in
  socket.on('candidate_checkin', async (data) => {
    try {
      let candidate = await Candidate.findOne({ interviewCode: data.interviewCode });
      if (!candidate) {
        candidate = new Candidate({ interviewCode: data.interviewCode });
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
      const candidate = await Candidate.findOne({ interviewCode: data.interviewCode });
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
  let { code, tableNumber } = req.body;
  if (code) code = code.trim().toUpperCase(); // Normalize for PVxxx and MSSV matching
  
  try {
    // 1. Check if Candidate
    let candidate = await Candidate.findOne({ interviewCode: code });
    if (candidate) {
      return res.json({ success: true, role: 'candidate', interviewCode: candidate.interviewCode });
    }

    // 2. Check if Staff (case-insensitive)
    let user = await User.findOne({ username: { $regex: new RegExp(`^${code}$`, 'i') } });
    if (user) {
      if (user.role === 'interviewer' && tableNumber) {
        user.tableNumber = tableNumber;
      }
      user.status = 'active';
      await user.save();
      return res.json({ 
        success: true, 
        role: user.role, 
        username: user.username, 
        fullName: user.fullName,
        tableNumber: user.tableNumber,
        autoAssign: user.autoAssign
      });
    }

    // 3. Not found
    return res.status(401).json({ success: false, message: 'Sai Mã đăng nhập.' });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/board', async (req, res) => {
  const waiting = await Candidate.find({ status: 'waiting' }).sort({ checkInTime: 1 });
  const moving = await Candidate.find({ status: 'moving' });
  const interviewing = await Candidate.find({ status: 'interviewing' });
  const completed = await Candidate.find({ status: 'completed' });
  res.json({ waiting: [...waiting, ...moving], interviewing, completed });
});

app.get('/api/tv-board', async (req, res) => {
  const fields = {
    interviewCode: 1,
    status: 1,
    assignedTable: 1,
    'applicationData.Họ và tên': 1,
    checkInTime: 1
  };
  const waiting = await Candidate.find({ status: 'waiting' }).select(fields).sort({ checkInTime: 1 }).lean();
  const moving = await Candidate.find({ status: 'moving' }).select(fields).lean();
  const interviewing = await Candidate.find({ status: 'interviewing' }).select(fields).lean();
  
  // Sort moving candidates by latest first (assuming they moved recently)
  // For TV, we want 'moving' as recent calls, and top N 'waiting' as up next.
  res.json({ waiting, moving, interviewing });
});

app.post('/api/evaluation', async (req, res) => {
  const { interviewCode, interviewerUsername, attitudeScore, skillScore, problemSolvingScore, notes, result } = req.body;
  try {
    const evaluation = new Evaluation({
      interviewCode: interviewCode, interviewerUsername, attitudeScore, skillScore, problemSolvingScore, notes, result
    });
    await evaluation.save();

    const candidate = await Candidate.findOne({ interviewCode });
    if (candidate) {
      candidate.status = 'completed';
      candidate.interviewEndTime = new Date();
      await candidate.save();
    }

    const user = await User.findOne({ username: interviewerUsername });
    if (user) {
      user.status = 'active'; // Back to available
      await user.save();
    }

    io.emit('board_update');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sender, senderRole, receiver, content } = req.body;
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
    const candidate = await Candidate.findOne({ 
      interviewCode, 
      status: { $in: ['moving', 'interviewing'] } 
    });
    if (!candidate) return res.status(400).json({ success: false, message: 'Ứng viên không trong trạng thái đang gọi/phỏng vấn' });

    const interviewer = await User.findOne({ username });
    if (interviewer) {
      interviewer.status = 'active';
      await interviewer.save();
    }

    // Set checkInTime to 0 so they sort to the very top of the waiting queue
    candidate.status = 'waiting';
    candidate.assignedTable = null;
    candidate.checkInTime = new Date(0);
    await candidate.save();

    io.emit('board_update');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/interviewer/call', async (req, res) => {
  const { username, interviewCode } = req.body;
  try {
    const interviewer = await User.findOne({ username, role: 'interviewer', status: 'active' });
    if (!interviewer) return res.status(400).json({ success: false, message: 'Interviewer not ready' });

    const candidate = await Candidate.findOne({ interviewCode, status: 'waiting' });
    if (!candidate) return res.status(400).json({ success: false, message: 'Candidate no longer available' });

    candidate.status = 'moving';
    candidate.assignedTable = interviewer.tableNumber;
    await candidate.save();

    interviewer.status = 'interviewing';
    await interviewer.save();

    io.emit('candidate_assigned', { candidate, tableNumber: interviewer.tableNumber });
    io.emit('board_update');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staff/switch-role', async (req, res) => {
  const { username, targetRole, tableNumber } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Safety check, although frontend restricts it too
    if (!['Trần Đức Hoàng Anh', 'Kiều Minh Anh', 'Phạm Việt Bách'].includes(user.fullName)) {
      return res.status(403).json({ success: false, message: 'Not allowed to switch roles' });
    }

    user.role = targetRole;
    if (targetRole === 'interviewer' && tableNumber) {
      user.tableNumber = tableNumber;
    }
    await user.save();
    res.json({ success: true, role: user.role, tableNumber: user.tableNumber });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static frontend files
const buildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(buildPath));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
