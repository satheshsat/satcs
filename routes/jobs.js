const express = require('express');
const Job = require('../models/Job');
const { auth, employerOnly } = require('../middleware/auth');

const router = express.Router();

// List jobs (public) - with optional search and filters
router.get('/', async (req, res) => {
  try {
    const { q, type, location, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');
    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).populate('postedBy', 'name company').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Job.countDocuments(filter)
    ]);
    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    if (err.name === 'MongoError' && err.code === 27) {
      // No text index; fallback to simple search
      const { q, type, location, page = 1, limit = 10 } = req.query;
      const filter = {};
      if (q) {
        filter.$or = [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { company: new RegExp(q, 'i') }
        ];
      }
      if (type) filter.type = type;
      if (location) filter.location = new RegExp(location, 'i');
      const skip = (Number(page) - 1) * Number(limit);
      const [jobs, total] = await Promise.all([
        Job.find(filter).populate('postedBy', 'name company').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        Job.countDocuments(filter)
      ]);
      return res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get single job (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company email');
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create job (employer only)
router.post('/', auth, employerOnly, async (req, res) => {
  try {
    const { title, description, company, location, type, salary, skills } = req.body;
    if (!title || !description || !company) {
      return res.status(400).json({ error: 'Title, description and company are required.' });
    }
    const job = new Job({
      title,
      description,
      company: company || req.user.company,
      location: location || '',
      type: type || 'full-time',
      salary: salary || '',
      skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      postedBy: req.user._id
    });
    await job.save();
    const populated = await Job.findById(job._id).populate('postedBy', 'name company');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update job (employer, own jobs only)
router.put('/:id', auth, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own jobs.' });
    }
    const { title, description, company, location, type, salary, skills } = req.body;
    if (title) job.title = title;
    if (description) job.description = description;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;
    if (type) job.type = type;
    if (salary !== undefined) job.salary = salary;
    if (skills !== undefined) job.skills = Array.isArray(skills) ? skills : [skills];
    job.updatedAt = new Date();
    await job.save();
    const populated = await Job.findById(job._id).populate('postedBy', 'name company');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete job (employer, own jobs only)
router.delete('/:id', auth, employerOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own jobs.' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// My posted jobs (employer)
router.get('/my/posted', auth, employerOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
