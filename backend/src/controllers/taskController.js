import { validationResult } from 'express-validator';
import Task from '../models/Task.js';

// Get tasks list (Admin gets all tasks, regular user only gets their own tasks)
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Build the query: admin sees everything, normal user sees only their own tasks
    const query = req.user.role === 'admin' ? {} : { owner: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('owner', 'name email')
        .skip(skip)
        .limit(Number(limit))
        .sort('-createdAt'),
      Task.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

// Get a single task by its ID
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner', 'name email');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify ownership or admin status
    const isOwner = task.owner._id.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
    }

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// Create a new task (automatically sets the logged-in user as the owner)
export const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { title, description, status, priority } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      owner: req.user._id, // Set the current logged-in user as the owner
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// Update an existing task
export const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check permissions: only the owner or an admin can update this task
    const isOwner = task.owner.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    // Update only the fields that were provided in the request body
    const { title, description, status, priority } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// Delete a task by ID
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check permissions: only the owner or an admin can delete this task
    const isOwner = task.owner.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task removed' });
  } catch (err) {
    next(err);
  }
};
