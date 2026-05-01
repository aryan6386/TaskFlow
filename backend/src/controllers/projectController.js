const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

const isProjectMember = (project, userId) => {
  const uid = userId.toString();
  // After populate(), members are objects with ._id; before populate they are raw ObjectIds.
  // Use (m._id || m) to safely handle both cases.
  const ownerId = (project.owner._id || project.owner).toString();
  return (
    ownerId === uid ||
    project.members.some((m) => (m._id || m).toString() === uid)
  );
};

exports.getAllProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = {};
    } else {
      query = { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    }
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    // Attach task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const total = await Task.countDocuments({ project: p._id });
        const completed = await Task.countDocuments({ project: p._id, status: 'completed' });
        return { ...p.toObject(), taskCount: total, completedCount: completed };
      })
    );
    res.json({ projects: projectsWithCounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, description, status } = req.body;
    const project = await Project.create({
      name, description, status,
      owner: req.user._id,
      members: [req.user._id],
    });
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (req.user.role !== 'admin' && !isProjectMember(project, req.user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { name, description, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.members.some((m) => m.toString() === userId)) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    project.members.push(userId);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ error: 'Cannot remove the project owner' });
    }
    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
