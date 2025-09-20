import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Text,
  Button,
  Spinner,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell
} from '@fluentui/react-components';
import {
  Play24Regular,
  Document24Regular,     // ✅ Use this instead
  Calendar24Regular
} from '@fluentui/react-icons';
import axios from 'axios';
import { format } from 'date-fns';

function MeetingList() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/transcripts/meetings');
      setMeetings(response.data.value || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTranscript = async (meetingId) => {
    try {
      setProcessing({ ...processing, [meetingId]: true });
      
      const response = await axios.post(
        `http://localhost:5000/api/transcripts/process/${meetingId}`
      );
      
      alert(`Processing complete! Extracted ${response.data.tasksExtracted} tasks.`);
      
      // Update meeting status in local state
      setMeetings(meetings.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, transcript_processed: true }
          : meeting
      ));
    } catch (error) {
      console.error('Error processing transcript:', error);
      if (error.response?.status === 404) {
        alert('No transcripts found for this meeting. Make sure transcription was enabled during the meeting.');
      } else {
        alert('Error processing transcript. Please try again.');
      }
    } finally {
      setProcessing({ ...processing, [meetingId]: false });
    }
  };

  const viewTasks = async (meetingId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks/meeting/${meetingId}`);
      const tasks = response.data;
      
      if (tasks.length === 0) {
        alert('No tasks found for this meeting.');
        return;
      }
      
      // Simple modal-like display (you can enhance this with a proper modal)
      const taskList = tasks.map(task => 
        `• ${task.description} (${task.assignee}) - ${task.status}`
      ).join('\n');
      
      alert(`Tasks from this meeting:\n\n${taskList}`);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spinner />
        <Text>Loading meetings...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Text size={900} weight="bold">Meetings</Text>
        <Button appearance="primary" onClick={fetchMeetings}>
          Refresh
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <Text>No meetings found. Make sure you have online meetings in your Teams calendar.</Text>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Meeting Subject</TableHeaderCell>
                <TableHeaderCell>Date & Time</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar24Regular />
                      <Text weight="semibold">
                        {meeting.subject || 'Untitled Meeting'}
                      </Text>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Text>
                      {meeting.startDateTime ? 
                        format(new Date(meeting.startDateTime), 'MMM dd, yyyy HH:mm') : 
                        'Unknown'
                      }
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      color={meeting.transcript_processed ? 'success' : 'subtle'}
                      appearance="filled"
                    >
                      {meeting.transcript_processed ? 'Processed' : 'Not Processed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        appearance="primary"
                        size="small"
                        icon={<Play24Regular />}
                        disabled={processing[meeting.id]}
                        onClick={() => processTranscript(meeting.id)}
                      >
                        {processing[meeting.id] ? 'Processing...' : 'Process Transcript'}
                      </Button>
                      
                      {meeting.transcript_processed && (
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={<DocumentText24Regular />}
                          onClick={() => viewTasks(meeting.id)}
                        >
                          View Tasks
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Instructions */}
      <Card style={{ marginTop: '20px', padding: '20px' }}>
        <Text size={500} weight="semibold" style={{ marginBottom: '10px' }}>
          How to use:
        </Text>
        <Text size={300}>
          1. Enable transcription during your Teams meetings<br/>
          2. Wait 2-4 hours after the meeting for transcripts to be available<br/>
          3. Click "Process Transcript" to extract tasks automatically<br/>
          4. View and manage extracted tasks in the Tasks section
        </Text>
      </Card>
    </div>
  );
}

export default MeetingList;