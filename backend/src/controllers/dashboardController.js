const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let projectQuery, taskQuery;

    if (isAdmin) {
      projectQuery = {};
      taskQuery = {};
    } else {
      const userProjectIds = (
        await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
          .select('_id')
      ).map((p) => p._id);
      projectQuery = { _id: { $in: userProjectIds } };
      taskQuery = {
        $or: [
          { assignee: req.user._id },
          { createdBy: req.user._id },
        ],
      };
    }

    const now = new Date();
    const [totalProjects, totalTasks, completedTasks, overdueTasks] = await Promise.all([
      Project.countDocuments(projectQuery),
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'completed' }),
      Task.countDocuments({ ...taskQuery, dueDate: { $lt: now }, status: { $ne: 'completed' } }),
    ]);

    const recentTasks = await Task.find(taskQuery)
      .populate('project', 'name')
      .populate('assignee', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ totalProjects, totalTasks, completedTasks, overdueTasks, recentTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOverdue = async (req, res) => {
  try {
    const now = new Date();
    let query = { dueDate: { $lt: now }, status: { $ne: 'completed' } };
    if (req.user.role !== 'admin') {
      query.$or = [{ assignee: req.user._id }, { createdBy: req.user._id }];
    }
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ dueDate: 1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
