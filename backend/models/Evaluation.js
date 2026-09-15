const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  interviewCode: { type: String, required: true },
  department: { type: String, enum: ['TCKT', 'BCS'], default: 'TCKT' },
  interviewerUsername: { type: String, required: true },
  attitudeScore: { type: Number, min: 1, max: 10, required: true },
  skillScore: { type: Number, min: 1, max: 10, required: true },
  problemSolvingScore: { type: Number, min: 1, max: 10, required: true },
  notes: { type: String },
  result: { 
    type: String, 
    enum: ['Đạt', 'Không đạt', 'Cân nhắc thêm'], 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', evaluationSchema);
