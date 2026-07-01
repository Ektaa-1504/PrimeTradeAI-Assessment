import express from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { taskRules, taskUpdateRules } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(taskRules, createTask);
router.route('/:id').get(getTask).patch(taskUpdateRules, updateTask).delete(deleteTask);

export default router;
