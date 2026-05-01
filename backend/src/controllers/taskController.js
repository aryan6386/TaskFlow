const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

const canAccessProject = async (userId, role, projectId) => {
  if (role === 'admin') return true;
  const project = await Project.findById(projectId);
  if (!project) return false;
  const uid = userId.toString();
  return project.owner.toString() === uid || project.members.some((m) => m.toString() === uid);
};

exports.getAllTasks = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = {};
    } else {
      query = { $or: [{ assignee: req.user._id }, { createdBy: req.user._id }] };
    }
    const { status, priority, projectId } = req.query;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (projectId) query.project = projectId;

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, description, projectId, assigneeId, priority, dueDate } = req.body;
    const accessible = await canAccessProject(req.user._id, req.user.role, projectId);
    if (!accessible) return res.status(403).json({ error: 'Access denied to this project' });
    const task = await Task.create({
      title, description, priority, dueDate: dueDate || null,
      project: projectId,
      assignee: assigneeId || null,
      createdBy: req.user._id,
    });
    await task.populate('project', 'name');
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const accessible = await canAccessProject(req.user._id, req.user.role, task.project._id);
    if (!accessible) return res.status(403).json({ error: 'Access denied' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    if (!isAdmin && !isAssignee) return res.status(403).json({ error: 'Access denied' });
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (isAdmin) {
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (assigneeId !== undefined) task.assignee = assigneeId || null;
    }
    await task.save();
    await task.populate('project', 'name');
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const accessible = await canAccessProject(req.user._id, req.user.role, req.params.projectId);
    if (!accessible) return res.status(403).json({ error: 'Access denied' });
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    if (!isAdmin && !isAssignee) return res.status(403).json({ error: 'Access denied' });
    const { status } = req.body;
    if (!['todo', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    task.status = status;
    await task.save();
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
