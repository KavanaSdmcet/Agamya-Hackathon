import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import TranscriptProcessor from './components/TranscriptProcessor';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <Router>
        <Navbar />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/processor" element={<TranscriptProcessor />} />
          </Routes>
        </div>
      </Router>
    </FluentProvider>
  );
}

export default App;