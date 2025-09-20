import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Text,
  Button,
  Textarea,
  Input,
  Spinner
} from '@fluentui/react-components';
import { Document24Regular } from '@fluentui/react-icons';
import EnhancedNLPService from '../services/nlpService';

const nlpService = new EnhancedNLPService();

function TranscriptProcessor({ user }) {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [processing, setProcessing] = useState(false);

  const sampleTranscript = `[00:00:10] Alice Johnson: Thanks for joining, Bob. Let's go over our project tasks.
[00:00:25] Bob Smith: I will update the API documentation by tomorrow.
[00:00:40] Alice Johnson: Great. I'll prepare the presentation slides for Friday's demo.
[00:01:05] Bob Smith: We should also test the new authentication flow. I can handle that by next Monday.
[00:01:20] Alice Johnson: Perfect. I need to send the meeting summary to the client today.
[00:01:35] Bob Smith: Okay, and I'll review the deployment checklist before end of this week.
[00:02:00] Alice Johnson: Let's also make sure we coordinate with the QA team. We need to schedule testing sessions.
[00:02:15] Bob Smith: Sarah should be involved in the testing planning. I'll reach out to her tomorrow.
[00:02:30] Alice Johnson: Good thinking. I also have to update the project timeline and share it with the team.
[00:02:50] Bob Smith: We must finalize the user acceptance criteria by Wednesday. That's critical for the demo.
[00:03:10] Alice Johnson: Carol will handle the user training documentation. Let's make sure she has what she needs.
[00:03:25] Bob Smith: I'll coordinate with Carol on that. We should also assign someone to review the security checklist.
[00:03:40] Alice Johnson: Perfect. Let's wrap up - everyone knows their action items for this week.`;

  const loadSample = () => {
    setTranscript(sampleTranscript);
    setMeetingTitle('Project Planning Meeting');
  };

  const processTranscript = () => {
    if (!transcript.trim()) {
      alert('Please enter a transcript first!');
      return;
    }

    setProcessing(true);
    
    // Simulate processing delay for enhanced analysis
    setTimeout(() => {
      const result = nlpService.extractTasksFromTranscript(transcript, meetingTitle);
      
      // Store enhanced data in localStorage
      localStorage.setItem('extractedTasks', JSON.stringify(result.tasks));
      localStorage.setItem('meetingSummary', JSON.stringify(result.summary));
      localStorage.setItem('meetingSpeakers', JSON.stringify(result.speakers));
      localStorage.setItem('meetingTimeline', JSON.stringify(result.timeline));
      localStorage.setItem('lastProcessedMeeting', meetingTitle || 'Untitled Meeting');
      
      // Show detailed results
      const teamTasks = result.tasks.filter(t => t.assignee.includes('Team') || t.assignee.includes('&'));
      const individualTasks = result.tasks.filter(t => !t.assignee.includes('Team') && !t.assignee.includes('&'));
      
      setProcessing(false);
      alert(`Processing complete! 
      
Extracted ${result.tasks.length} total tasks:
• ${individualTasks.length} individual assignments
• ${teamTasks.length} team/collaborative tasks
• ${result.summary.tasksWithDeadlines} tasks with deadlines
• Average confidence: ${Math.round(result.summary.averageConfidence * 100)}%

Check the Dashboard and Tasks sections for detailed view.`);
    }, 2000);
  };

  const processFromUrl = async () => {
    if (!meetingUrl.trim()) {
      alert('Please enter a Teams meeting URL first!');
      return;
    }

    setProcessing(true);
    
    try {
      // This would call your backend API to extract transcript from Teams URL
      const response = await fetch('/api/process-teams-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ meetingUrl })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTranscript(data.transcript);
        setMeetingTitle(data.meetingTitle || 'Teams Meeting');
        alert('Transcript extracted successfully! You can now process it for tasks.');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to extract transcript');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Could not extract transcript: ${error.message}\n\nPlease try the manual input method below.`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Text size={900} weight="bold" style={{ marginBottom: '20px' }}>
        Process Meeting Transcript
      </Text>

      {/* URL Processing Section */}
      <Card style={{ marginBottom: '30px' }}>
        <CardHeader
          header={<Text size={600} weight="semibold">Microsoft Teams Meeting URL</Text>}
        />
        <div style={{ padding: '0 20px 20px' }}>
          <Input
            placeholder="Paste Microsoft Teams meeting URL here..."
            value={meetingUrl}
            onChange={(_, data) => setMeetingUrl(data.value)}
            style={{ width: '100%', marginBottom: '15px' }}
          />
          <Button
            appearance="secondary"
            onClick={processFromUrl}
            disabled={!meetingUrl.trim() || processing}
            style={{ width: '100%' }}
          >
            {processing ? 'Extracting from Teams...' : 'Extract Transcript from URL'}
          </Button>
        </div>
      </Card>

      {/* Manual Transcript Section */}
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Manual Transcript Input</Text>}
          description={
            <Text size={300}>
              Enhanced parsing supports timestamps, pronoun resolution, and team assignment classification
            </Text>
          }
          action={
            <Button appearance="subtle" onClick={loadSample}>
              Load Sample
            </Button>
          }
        />
        <div style={{ padding: '0 20px 20px' }}>
          <Input
            placeholder="Meeting title (optional)"
            value={meetingTitle}
            onChange={(_, data) => setMeetingTitle(data.value)}
            style={{ width: '100%', marginBottom: '15px' }}
          />
          
          <Textarea
            placeholder="Paste meeting transcript here... 
            
Supports formats like:
[00:00:10] Alice: I'll handle the documentation
Bob: We should test this by Friday
[10:15] Carol: Let's coordinate on this task"
            value={transcript}
            onChange={(_, data) => setTranscript(data.value)}
            rows={15}
            style={{ width: '100%', marginBottom: '15px' }}
          />
          
          <Button
            appearance="primary"
            icon={processing ? <Spinner size="tiny" /> : <Document24Regular />}
            onClick={processTranscript}
            disabled={processing || !transcript.trim()}
            style={{ width: '100%' }}
          >
            {processing ? 'Processing with Enhanced NLP...' : `Analyze Transcript (${transcript.length} chars)`}
          </Button>
        </div>
      </Card>

      {/* Enhanced Features Info */}
      <Card style={{ marginTop: '30px', padding: '20px' }}>
        <Text size={500} weight="semibold" style={{ marginBottom: '10px' }}>
          Enhanced Features:
        </Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <Text size={300} weight="semibold">🎯 Better Task Detection:</Text>
            <Text size={300} style={{ display: 'block', color: '#605e5c' }}>
              • "I will/I'll" assignments<br/>
              • "We should/need to" team tasks<br/>
              • Direct name assignments<br/>
              • Responsibility statements
            </Text>
          </div>
          <div>
            <Text size={300} weight="semibold">👥 Smart Pronoun Resolution:</Text>
            <Text size={300} style={{ display: 'block', color: '#605e5c' }}>
              • Resolves "I", "you", "we" references<br/>
              • Identifies team vs individual tasks<br/>
              • Tracks conversation context<br/>
              • Maps speakers to assignments
            </Text>
          </div>
          <div>
            <Text size={300} weight="semibold">⏰ Timestamp Support:</Text>
            <Text size={300} style={{ display: 'block', color: '#605e5c' }}>
              • Handles [00:00:10] format<br/>
              • Supports [10:15] short format<br/>
              • Creates meeting timeline<br/>
              • Better deadline parsing
            </Text>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card style={{ marginTop: '20px', padding: '20px' }}>
        <Text size={500} weight="semibold" style={{ marginBottom: '10px' }}>
          Usage Instructions:
        </Text>
        <Text size={300}>
          1. <strong>Teams URL:</strong> Paste the meeting URL to automatically extract transcript (requires authentication)<br/>
          2. <strong>Manual Input:</strong> Copy transcript from Teams, Zoom, or any meeting platform<br/>
          3. <strong>Format:</strong> "Speaker: What they said" or "[timestamp] Speaker: Content"<br/>
          4. <strong>Enhanced Analysis:</strong> System will identify who does what, resolve pronouns, and classify team tasks<br/>
          5. <strong>Review Results:</strong> Check Dashboard for summary, Tasks section for detailed management
        </Text>
      </Card>
    </div>
  );
}

export default TranscriptProcessor;