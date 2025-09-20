import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  Text, 
  Button, 
  Textarea, 
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Badge,
  Spinner,
  Dropdown,
  Option
} from '@fluentui/react-components';
import { 
  Upload24Regular, 
  CheckboxChecked24Regular,
  Delete24Regular 
} from '@fluentui/react-icons';

// Simple NLP task extraction (client-side version)
const extractTasksFromTranscript = (transcriptText, meetingTitle = 'Meeting') => {
  const actionWords = [
    'will', 'should', 'need to', 'have to', 'must', 'going to',
    'responsible for', 'assigned to', 'take care of', 'handle',
    'complete', 'finish', 'deliver', 'prepare', 'create', 'review',
    'follow up', 'send', 'schedule', 'contact', 'update'
  ];
  
  const timeWords = [
    'today', 'tomorrow', 'next week', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday', 'sunday', 'by', 'before',
    'deadline', 'due', 'end of', 'this week', 'next month'
  ];

  // Split into sentences
  const sentences = transcriptText
    .replace(/\[[\d:]+\]/g, '') // Remove timestamps
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 10);

  const tasks = [];

  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    
    // Check if sentence contains action indicators
    const hasAction = actionWords.some(word => lowerSentence.includes(word));
    
    if (!hasAction) return;

    // Extract potential assignee (simple name extraction)
    let assignee = 'Unassigned';
    const namePatterns = [
      /\b([A-Z][a-z]+)\s+will\b/i,
      /\b([A-Z][a-z]+)\s+should\b/i,
      /\bassigned to\s+([A-Z][a-z]+)/i,
      /\b([A-Z][a-z]+)\s+needs? to\b/i
    ];
    
    for (const pattern of namePatterns) {
      const match = sentence.match(pattern);
      if (match) {
        assignee = match[1];
        break;
      }
    }

    // Extract potential deadline
    let deadline = null;
    const datePatterns = [
      /\b(today|tomorrow)\b/i,
      /\bnext (week|month)\b/i,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\bby ([\w\s]+)/i,
      /\bdue ([\w\s]+)/i
    ];

    for (const pattern of datePatterns) {
      const match = sentence.match(pattern);
      if (match) {
        deadline = match[0];
        break;
      }
    }

    // Calculate confidence
    let confidence = 0.5;
    if (lowerSentence.includes('will') || lowerSentence.includes('assigned')) confidence += 0.3;
    if (deadline) confidence += 0.2;
    if (assignee !== 'Unassigned') confidence += 0.2;

    tasks.push({
      id: `task_${Date.now()}_${index}`,
      description: sentence.trim(),
      assignee,
      deadline,
      status: 'pending',
      confidence: Math.min(confidence, 1.0),
      extractedAt: new Date().toLocaleString()
    });
  });

  return tasks;
};

export default function SimpleTranscriptExtractor() {
  const [transcript, setTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Sample transcript for testing
  const sampleTranscript = `[10:15] John: Thanks everyone for joining. Let's review the project status.

[10:16] Sarah: The backend API is almost complete. I should have it ready by Friday.

[10:17] Mike: I'll take care of the frontend integration once Sarah's done. Need to finish the user interface.

[10:18] John: Great. Lisa, can you prepare the documentation by next Tuesday?

[10:19] Lisa: Sure, I'll create the user guide and API documentation. Will send it to everyone by Monday.

[10:20] Sarah: I also need to schedule a code review session with the team. Let's do it Thursday afternoon.

[10:21] Mike: Don't forget we have to update the deployment scripts. Tom, you were responsible for that, right?

[10:22] Tom: Yes, I'll handle the deployment automation. Should be completed before the end of this week.

[10:23] John: Perfect. Sarah, please follow up with the client about their feedback on the mockups.

[10:24] Lisa: I'll also contact the QA team to schedule testing for next week.`;

  const handleExtractTasks = async () => {
    if (!transcript.trim()) {
      alert('Please enter a transcript first!');
      return;
    }

    setLoading(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const extractedTasks = extractTasksFromTranscript(transcript, meetingTitle);
    setTasks(extractedTasks);
    setLoading(false);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const loadSample = () => {
    setTranscript(sampleTranscript);
    setMeetingTitle('Project Status Meeting');
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      default: return 'important';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <Text size={900} weight="bold">Teams Transcript Task Extractor</Text>
        <Text size={400} style={{ display: 'block', marginTop: '8px', color: '#605e5c' }}>
          Paste your meeting transcript below to automatically extract action items and tasks
        </Text>
      </div>

      {/* Input Section */}
      <Card style={{ marginBottom: '30px' }}>
        <CardHeader
          header={<Text size={600} weight="semibold">Meeting Transcript</Text>}
          action={
            <Button 
              appearance="subtle" 
              onClick={loadSample}
            >
              Load Sample
            </Button>
          }
        />
        <div style={{ padding: '0 20px 20px' }}>
          <Input
            placeholder="Enter meeting title (optional)"
            value={meetingTitle}
            onChange={(_, data) => setMeetingTitle(data.value)}
            style={{ marginBottom: '15px', width: '100%' }}
          />
          
          <Textarea
            placeholder="Paste your meeting transcript here..."
            value={transcript}
            onChange={(_, data) => setTranscript(data.value)}
            rows={12}
            style={{ width: '100%', marginBottom: '15px' }}
          />
          
          <Button
            appearance="primary"
            icon={<CheckboxChecked24Regular />}
            onClick={handleExtractTasks}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? <Spinner size="tiny" /> : 'Extract Tasks'}
            {loading ? ' Processing...' : ` Extract Tasks (${transcript.length} characters)`}
          </Button>
        </div>
      </Card>

      {/* Results Section */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Text size={600} weight="semibold">
                  Extracted Tasks ({filteredTasks.length})
                </Text>
                <Dropdown
                  placeholder="Filter by status"
                  value={filter}
                  onOptionSelect={(_, data) => setFilter(data.optionValue)}
                >
                  <Option value="all">All Tasks</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="in-progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                </Dropdown>
              </div>
            }
          />
          
          <div style={{ padding: '0 20px 20px' }}>
            {filteredTasks.length === 0 ? (
              <Text>No tasks match the current filter.</Text>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Task Description</TableHeaderCell>
                    <TableHeaderCell>Assignee</TableHeaderCell>
                    <TableHeaderCell>Deadline</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Confidence</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div style={{ maxWidth: '300px' }}>
                          <Text size={300} weight="semibold">
                            {task.description.length > 100 
                              ? `${task.description.substring(0, 100)}...` 
                              : task.description
                            }
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge appearance="outline">{task.assignee}</Badge>
                      </TableCell>
                      <TableCell>
                        <Text size={300}>
                          {task.deadline || 'No deadline'}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Dropdown
                          value={task.status}
                          onOptionSelect={(_, data) => updateTaskStatus(task.id, data.optionValue)}
                        >
                          <Option value="pending">Pending</Option>
                          <Option value="in-progress">In Progress</Option>
                          <Option value="completed">Completed</Option>
                        </Dropdown>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          color={task.confidence > 0.7 ? 'success' : 
                                task.confidence > 0.5 ? 'warning' : 'important'}
                        >
                          {Math.round(task.confidence * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          appearance="subtle"
                          icon={<Delete24Regular />}
                          onClick={() => deleteTask(task.id)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card style={{ marginTop: '30px', padding: '20px' }}>
        <Text size={500} weight="semibold" style={{ marginBottom: '10px' }}>
          How to use:
        </Text>
        <Text size={300}>
          1. Paste your Teams meeting transcript in the text area above<br/>
          2. Add an optional meeting title for context<br/>
          3. Click "Extract Tasks" to automatically identify action items<br/>
          4. Review, edit, and manage the extracted tasks<br/>
          5. Update task status as work progresses
        </Text>
      </Card>
    </div>
  );
}