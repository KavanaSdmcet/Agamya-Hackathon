const express = require('express');
const { 
    getTasks, 
    getTaskById, 
    updateTaskStatus, 
    deleteTask,
    getTasksByMeeting 
} = require('../database/taskService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, assignee, meeting } = req.query;
        const tasks = await getTasks(req.userId, { status, assignee, meeting });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get tasks for specific meeting
router.get('/meeting/:meetingId', authenticateToken, async (req, res) => {
    try {
        const tasks = await getTasksByMeeting(req.params.meetingId);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update task status
router.put('/:taskId/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    
    try {
        await updateTaskStatus(req.params.taskId, status);
        res.json({ message: 'Task status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete task
router.delete('/:taskId', authenticateToken, async (req, res) => {
    try {
        await deleteTask(req.params.taskId);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;