const express = require('express');
const GraphService = require('../services/graphService');
const NLPService = require('../services/nlpService');
const { getUserById } = require('../database/userService');
const { saveMeeting, getMeetings } = require('../database/meetingService');
const { saveTasks } = require('../database/taskService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const nlpService = new NLPService();

// Get user's meetings
router.get('/meetings', authenticateToken, async (req, res) => {
    try {
        const user = await getUserById(req.userId);
        const graphService = new GraphService(user.access_token);
        
        const meetings = await graphService.getOnlineMeetings();
        
        // Save meetings to database
        for (const meeting of meetings.value || []) {
            await saveMeeting({
                id: meeting.id,
                user_id: user.id,
                subject: meeting.subject,
                start_time: meeting.startDateTime,
                end_time: meeting.endDateTime
            });
        }
        
        res.json(meetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Process meeting transcript
router.post('/process/:meetingId', authenticateToken, async (req, res) => {
    const { meetingId } = req.params;
    
    try {
        const user = await getUserById(req.userId);
        const graphService = new GraphService(user.access_token);
        
        // Get transcripts for the meeting
        const transcripts = await graphService.getMeetingTranscripts(meetingId);
        
        if (!transcripts.value || transcripts.value.length === 0) {
            return res.status(404).json({ error: 'No transcripts found for this meeting' });
        }
        
        const allTasks = [];
        
        // Process each transcript
        for (const transcript of transcripts.value) {
            const transcriptContent = await graphService.getTranscriptContent(
                meetingId, 
                transcript.id
            );
            
            // Extract tasks using NLP
            const extractedTasks = nlpService.extractTasks(
                transcriptContent,
                meetingId,
                new Date()
            );
            
            allTasks.push(...extractedTasks);
        }
        
        // Save tasks to database
        if (allTasks.length > 0) {
            await saveTasks(allTasks);
        }
        
        res.json({ 
            message: `Processed ${transcripts.value.length} transcripts`,
            tasksExtracted: allTasks.length,
            tasks: allTasks
        });
    } catch (error) {
        console.error('Error processing transcript:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;