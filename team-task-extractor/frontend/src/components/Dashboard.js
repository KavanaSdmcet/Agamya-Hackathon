import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Text,
  Button,
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell
} from '@fluentui/react-components';
import {
  Checkmark24Regular,
  Person24Regular,
  Calendar24Regular
} from '@fluentui/react-icons';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [speakers, setSpeakers] = useState([]);
  const [lastMeeting, setLastMeeting] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const storedTasks = localStorage.getItem('extractedTasks');
    const storedSummary = localStorage.getItem('meetingSummary');
    const storedSpeakers = localStorage.getItem('meetingSpeakers');
    const storedMeeting = localStorage.getItem('lastProcessedMeeting');

    if (storedTasks) setTasks(JSON.parse(storedTasks));
    if (storedSummary) setSummary(JSON.parse(storedSummary));
    if (storedSpeakers) setSpeakers(JSON.parse(storedSpeakers));
    if (storedMeeting) setLastMeeting(storedMeeting);
  };

  const getTasksByAssignee = () => {
    const tasksByAssignee = {};
    tasks.forEach(task => {
      if (!tasksByAssignee[task.assignee]) {
        tasksByAssignee[task.assignee] = [];
      }
      tasksByAssignee[task.assignee].push(task);
    });
    return tasksByAssignee;
  };

  const getUpcomingDeadlines = () => {
    return tasks
      .filter(task => task.deadline && task.status !== 'completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  };

  const tasksByAssignee = getTasksByAssignee();
  const upcomingDeadlines = getUpcomingDeadlines();

  if (!summary) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text size={600}>No meeting data available.</Text>
        <Text size={400} style={{ display: 'block', marginTop: '10px' }}>
          Process a meeting transcript first to see the dashboard.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <Text size={900} weight="bold">Manager Dashboard</Text>
          <Text size={400} style={{ display: 'block', marginTop: '5px', color: '#605e5c' }}>
            {lastMeeting}
          </Text>
        </div>
        <Button appearance="primary" onClick={loadDashboardData}>
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Checkmark24Regular style={{ fontSize: '32px', color: '#0078d4', marginBottom: '10px' }} />
            <Text size={800} weight="bold" style={{ display: 'block' }}>
              {summary.totalTasks}
            </Text>
            <Text size={300}>Total Tasks</Text>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Person24Regular style={{ fontSize: '32px', color: '#107c10', marginBottom: '10px' }} />
            <Text size={800} weight="bold" style={{ display: 'block' }}>
              {summary.assignedTasks}
            </Text>
            <Text size={300}>Assigned Tasks</Text>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Calendar24Regular style={{ fontSize: '32px', color: '#d83b01', marginBottom: '10px' }} />
            <Text size={800} weight="bold" style={{ display: 'block' }}>
              {summary.tasksWithDeadlines}
            </Text>
            <Text size={300}>With Deadlines</Text>
          </div>
        </Card>
      </div>

      {/* Tasks by Assignee */}
      <Card style={{ marginBottom: '30px' }}>
        <CardHeader
          header={<Text size={600} weight="semibold">Tasks by Assignee</Text>}
        />
        <div style={{ padding: '0 20px 20px' }}>
          {Object.entries(tasksByAssignee).map(([assignee, assigneeTasks]) => (
            <div key={assignee} style={{ 
              padding: '15px', 
              borderBottom: '1px solid #edebe9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Text weight="semibold" size={400}>{assignee}</Text>
                <Text size={300} style={{ color: '#605e5c', marginTop: '5px' }}>
                  {assigneeTasks.length} task{assigneeTasks.length !== 1 ? 's' : ''}
                </Text>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {assigneeTasks.slice(0, 3).map(task => (
                  <Badge key={task.id} appearance="outline" size="small">
                    {task.description.substring(0, 30)}...
                  </Badge>
                ))}
                {assigneeTasks.length > 3 && (
                  <Badge appearance="ghost">+{assigneeTasks.length - 3} more</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Upcoming Deadlines</Text>}
        />
        <div style={{ padding: '0 20px 20px' }}>
          {upcomingDeadlines.length === 0 ? (
            <Text size={300} style={{ color: '#605e5c' }}>No upcoming deadlines</Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Task</TableHeaderCell>
                  <TableHeaderCell>Assignee</TableHeaderCell>
                  <TableHeaderCell>Deadline</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingDeadlines.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Text size={300}>
                        {task.description.length > 40 
                          ? `${task.description.substring(0, 40)}...`
                          : task.description
                        }
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Badge appearance="outline">{task.assignee}</Badge>
                    </TableCell>
                    <TableCell>
                      <Text size={300}>{task.deadline}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge color="warning">{task.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
