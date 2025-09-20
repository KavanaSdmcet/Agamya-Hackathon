import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Text,
  Button,
  Badge,
  Dropdown,
  Option,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Tab,
  TabList,
  Textarea,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Toast,
  Toaster,
  useToastController
} from '@fluentui/react-components';
import { 
  Dismiss24Regular, 
  Person24Regular, 
  People24Regular,
  Edit24Regular,
  Save24Regular,
  Checkmark24Regular,
  Add24Regular,
  Eye24Regular,
  Calendar24Regular
} from '@fluentui/react-icons';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [speakers, setSpeakers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { dispatchToast } = useToastController();

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, activeTab, statusFilter, searchTerm]);

  const loadTasks = () => {
    setLoading(true);
    try {
      const storedTasks = localStorage.getItem('extractedTasks');
      const storedSpeakers = localStorage.getItem('meetingSpeakers');
      
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      }
      
      if (storedSpeakers) {
        setSpeakers(JSON.parse(storedSpeakers));
      }
    } catch (error) {
      showToast('Error loading tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, intent = 'success') => {
    dispatchToast(
      <Toast>
        <Text>{message}</Text>
      </Toast>,
      { intent, timeout: 3000 }
    );
  };

  const applyFilters = () => {
    let filtered = tasks;

    // Filter by assignee tab
    if (activeTab === 'team') {
      filtered = filtered.filter(task => 
        task.assignee === 'Team' || 
        task.assignee.includes('&') || 
        task.assignee.includes('Team (') ||
        task.type === 'team_assignment'
      );
    } else if (activeTab !== 'all') {
      filtered = filtered.filter(task => 
        task.assignee === activeTab || 
        (task.assignee.includes('&') && task.assignee.includes(activeTab))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.originalSentence.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { 
          ...task, 
          status: newStatus, 
          updatedAt: new Date().toISOString(),
          statusHistory: [...(task.statusHistory || []), {
            status: newStatus,
            changedAt: new Date().toISOString()
          }]
        } : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('extractedTasks', JSON.stringify(updatedTasks));
      showToast(`Task status updated to ${newStatus}`);
    } catch (error) {
      showToast('Error updating task status', 'error');
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('extractedTasks', JSON.stringify(updatedTasks));
      showToast('Task updated successfully');
    } catch (error) {
      showToast('Error updating task', 'error');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem('extractedTasks', JSON.stringify(updatedTasks));
      showToast('Task deleted successfully');
    } catch (error) {
      showToast('Error deleting task', 'error');
    }
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditForm({
      description: task.description,
      assignee: task.assignee,
      deadline: task.deadline || ''
    });
  };

  const saveEdit = async (taskId) => {
    try {
      await updateTask(taskId, editForm);
      setEditingTask(null);
      setEditForm({});
    } catch (error) {
      showToast('Error saving changes', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setEditForm({});
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const getTasksByAssignee = () => {
    const tasksByAssignee = { 'all': tasks.length };
    
    // Count team tasks
    const teamTasks = tasks.filter(task => 
      task.assignee === 'Team' || 
      task.assignee.includes('&') || 
      task.assignee.includes('Team (') ||
      task.type === 'team_assignment'
    );
    tasksByAssignee['team'] = teamTasks.length;

    // Count individual speaker tasks
    speakers.forEach(speaker => {
      const speakerTasks = tasks.filter(task => 
        task.assignee === speaker || 
        (task.assignee.includes('&') && task.assignee.includes(speaker))
      );
      tasksByAssignee[speaker] = speakerTasks.length;
    });

    return tasksByAssignee;
  };

  const getTabTitle = (tabKey) => {
    switch (tabKey) {
      case 'all': return 'All Tasks';
      case 'team': return 'Team Tasks';
      default: return tabKey;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'important';
      default: return 'subtle';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.7) return 'success';
    if (confidence > 0.5) return 'warning';
    return 'important';
  };

  const getPriorityFromDeadline = (deadline) => {
    if (!deadline) return 'low';
    const daysUntil = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 1) return 'urgent';
    if (daysUntil <= 3) return 'high';
    if (daysUntil <= 7) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'brand';
      case 'low': return 'subtle';
      default: return 'subtle';
    }
  };

  const tasksByAssignee = getTasksByAssignee();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spinner size="large" />
        <Text size={500} style={{ marginTop: '20px' }}>Loading tasks...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Toaster />
      
      {/* Header */}
      <Card style={{ marginBottom: '20px', background: 'linear-gradient(90deg, #0078d4 0%, #106ebe 100%)', color: 'white' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text size={900} weight="bold" style={{ color: 'white' }}>Task Management Dashboard</Text>
              <Text size={400} style={{ color: 'rgba(255,255,255,0.8)', marginTop: '5px' }}>
                Manage and track all meeting action items
              </Text>
            </div>
            <Button appearance="outline" onClick={loadTasks} style={{ color: 'white', borderColor: 'white' }}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <Card>
          <div style={{ padding: '15px', textAlign: 'center' }}>
            <Text size={700} weight="bold" style={{ color: '#0078d4' }}>{tasks.length}</Text>
            <Text size={300}>Total Tasks</Text>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '15px', textAlign: 'center' }}>
            <Text size={700} weight="bold" style={{ color: '#107c10' }}>
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
            <Text size={300}>Completed</Text>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '15px', textAlign: 'center' }}>
            <Text size={700} weight="bold" style={{ color: '#d83b01' }}>
              {tasks.filter(t => getPriorityFromDeadline(t.deadline) === 'urgent').length}
            </Text>
            <Text size={300}>Urgent</Text>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '15px', textAlign: 'center' }}>
            <Text size={700} weight="bold" style={{ color: '#5c2d91' }}>
              {tasksByAssignee['team'] || 0}
            </Text>
            <Text size={300}>Team Tasks</Text>
          </div>
        </Card>
      </div>

      {/* Assignee Tabs */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <TabList 
            selectedValue={activeTab}
            onTabSelect={(_, data) => setActiveTab(data.value)}
          >
            <Tab value="all">
              All Tasks ({tasksByAssignee['all'] || 0})
            </Tab>
            <Tab value="team" icon={<People24Regular />}>
              Team Tasks ({tasksByAssignee['team'] || 0})
            </Tab>
            {speakers.map(speaker => (
              <Tab key={speaker} value={speaker} icon={<Person24Regular />}>
                {speaker} ({tasksByAssignee[speaker] || 0})
              </Tab>
            ))}
          </TabList>
        </div>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
            <Text weight="semibold" size={500}>Filters:</Text>
            
            <Dropdown
              placeholder="Status"
              value={statusFilter}
              onOptionSelect={(_, data) => setStatusFilter(data.optionValue)}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Dropdown>

            <Input
              placeholder="Search tasks, assignees, or content..."
              value={searchTerm}
              onChange={(_, data) => setSearchTerm(data.value)}
              style={{ minWidth: '300px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Badge appearance="filled" color="subtle">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </Badge>
            {activeTab === 'team' && (
              <Badge appearance="filled" color="brand">
                Collaborative Tasks
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader
          header={
            <Text size={600} weight="semibold">
              {getTabTitle(activeTab)} ({filteredTasks.length})
            </Text>
          }
        />
        
        {filteredTasks.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Text size={500} weight="semibold">No tasks found</Text>
            <Text size={300} style={{ marginTop: '10px', color: '#605e5c' }}>
              {activeTab === 'team' 
                ? 'Team tasks include assignments using "we", "let\'s", or multiple people.'
                : 'Process a meeting transcript to get started or adjust your filters.'
              }
            </Text>
            {tasks.length === 0 && (
              <Button 
                appearance="primary" 
                style={{ marginTop: '20px' }}
                onClick={() => window.location.href = '/processor'}
              >
                Process Meeting Transcript
              </Button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table aria-label="Tasks table">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Task Details</TableHeaderCell>
                  <TableHeaderCell>Assignee</TableHeaderCell>
                  <TableHeaderCell>Deadline</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Priority</TableHeaderCell>
                  <TableHeaderCell>Confidence</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const priority = getPriorityFromDeadline(task.deadline);
                  
                  return (
                    <TableRow key={task.id}>
                      <TableCell style={{ maxWidth: '300px' }}>
                        {editingTask === task.id ? (
                          <Textarea
                            value={editForm.description}
                            onChange={(_, data) => setEditForm({ ...editForm, description: data.value })}
                            rows={2}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          <div>
                            <Text size={300} weight="semibold">
                              {task.description}
                            </Text>
                            <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              {task.timestamp && (
                                <Badge appearance="ghost" size="small">
                                  {task.timestamp}
                                </Badge>
                              )}
                              {task.type && (
                                <Badge appearance="ghost" size="small">
                                  {task.type.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {editingTask === task.id ? (
                          <Dropdown
                            value={editForm.assignee}
                            onOptionSelect={(_, data) => setEditForm({ ...editForm, assignee: data.optionValue })}
                          >
                            <Option value="Team">Team</Option>
                            {speakers.map(speaker => (
                              <Option key={speaker} value={speaker}>{speaker}</Option>
                            ))}
                            <Option value="Unassigned">Unassigned</Option>
                          </Dropdown>
                        ) : (
                          <Badge 
                            appearance={task.assignee === 'Team' || task.assignee.includes('&') ? 'filled' : 'outline'}
                            color={task.assignee === 'Team' || task.assignee.includes('&') ? 'brand' : 'subtle'}
                          >
                            {task.assignee}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {editingTask === task.id ? (
                          <Input
                            type="date"
                            value={editForm.deadline}
                            onChange={(_, data) => setEditForm({ ...editForm, deadline: data.value })}
                            style={{ width: '140px' }}
                          />
                        ) : (
                          <div>
                            <Text size={300}>
                              {task.deadline || 'No deadline'}
                            </Text>
                            {task.deadline && (
                              <Text size={200} style={{ color: '#605e5c', display: 'block' }}>
                                {Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                              </Text>
                            )}
                          </div>
                        )}
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
                        <Badge color={getPriorityColor(priority)} appearance="filled">
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge color={getConfidenceColor(task.confidence)}>
                          {Math.round(task.confidence * 100)}%
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {editingTask === task.id ? (
                            <>
                              <Button
                                appearance="primary"
                                icon={<Save24Regular />}
                                onClick={() => saveEdit(task.id)}
                                size="small"
                              />
                              <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={cancelEdit}
                                size="small"
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                appearance="subtle"
                                icon={<Eye24Regular />}
                                onClick={() => viewTaskDetails(task)}
                                size="small"
                                title="View details"
                              />
                              <Button
                                appearance="subtle"
                                icon={<Edit24Regular />}
                                onClick={() => startEditing(task)}
                                size="small"
                                title="Edit task"
                              />
                              <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => deleteTask(task.id)}
                                size="small"
                                title="Delete task"
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Task Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(_, data) => setIsDialogOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Task Details</DialogTitle>
            <DialogContent>
              {selectedTask && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <Text weight="semibold">Description:</Text>
                    <Text style={{ display: 'block', marginTop: '5px' }}>
                      {selectedTask.description}
                    </Text>
                  </div>
                  
                  <div>
                    <Text weight="semibold">Original Context:</Text>
                    <Text size={300} style={{ 
                      display: 'block', 
                      marginTop: '5px', 
                      padding: '10px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '4px',
                      fontStyle: 'italic'
                    }}>
                      {selectedTask.speaker && `${selectedTask.speaker}: `}
                      "{selectedTask.originalSentence}"
                    </Text>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <Text weight="semibold">Assignee:</Text>
                      <Badge style={{ marginTop: '5px' }}>{selectedTask.assignee}</Badge>
                    </div>
                    <div>
                      <Text weight="semibold">Status:</Text>
                      <Badge color={getStatusColor(selectedTask.status)} style={{ marginTop: '5px' }}>
                        {selectedTask.status}
                      </Badge>
                    </div>
                    <div>
                      <Text weight="semibold">Deadline:</Text>
                      <Text style={{ display: 'block', marginTop: '5px' }}>
                        {selectedTask.deadline || 'No deadline set'}
                      </Text>
                    </div>
                    <div>
                      <Text weight="semibold">Confidence:</Text>
                      <Badge color={getConfidenceColor(selectedTask.confidence)} style={{ marginTop: '5px' }}>
                        {Math.round(selectedTask.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedTask.timestamp && (
                    <div>
                      <Text weight="semibold">Timeline:</Text>
                      <Text style={{ display: 'block', marginTop: '5px' }}>
                        Mentioned at {selectedTask.timestamp}
                      </Text>
                    </div>
                  )}
                  
                  <div>
                    <Text weight="semibold">Extracted:</Text>
                    <Text size={300} style={{ display: 'block', marginTop: '5px', color: '#605e5c' }}>
                      {new Date(selectedTask.extractedAt).toLocaleString()}
                    </Text>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              {selectedTask && (
                <Button 
                  appearance="primary" 
                  onClick={() => {
                    startEditing(selectedTask);
                    setIsDialogOpen(false);
                  }}
                >
                  Edit Task
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

export default TaskList;