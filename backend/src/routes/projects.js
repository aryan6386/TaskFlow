const express = require('express');
const { body } = require('express-validator');
const {
  getAllProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAllProjects);

router.post('/', adminOnly, [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('status').optional().isIn(['active', 'on_hold', 'completed']),
], createProject);

router.get('/:id', getProject);
router.put('/:id', adminOnly, updateProject);
router.delete('/:id', adminOnly, deleteProject);
router.post('/:id/members', adminOnly, [
  body('userId').notEmpty().withMessage('userId is required'),
], addMember);
router.delete('/:id/members/:userId', adminOnly, removeMember);

module.exports = router;
