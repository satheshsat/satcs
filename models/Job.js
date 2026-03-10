const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  salary: { type: String, trim: true },
  skills: [{ type: String, trim: true }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
