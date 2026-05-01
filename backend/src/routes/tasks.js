const express = require('express');
const { body } = require('express-validator');
const {
  getAllTasks, createTask, getTask,
  updateTask, deleteTask, getTasksByProject, updateTaskStatus,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAllTasks);

router.post('/', adminOnly, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('projectId').notEmpty().withMessage('projectId is required'),
], createTask);

router.get('/project/:projectId', getTasksByProject);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
