import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Tab,
  TabList,
  Text
} from '@fluentui/react-components';
import {
  Home24Regular,
  Checkmark24Regular,
  Document24Regular
} from '@fluentui/react-icons';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabSelect = (_, data) => {
    navigate(data.value);
  };

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('tasks')) return '/tasks';
    if (path.includes('processor')) return '/processor';
    return '/dashboard';
  };

  return (
    <div style={{ 
      borderBottom: '1px solid #edebe9',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      height: '60px'
    }}>
      <Text size={600} weight="bold">
        Teams Task Extractor
      </Text>
      
      <TabList 
        selectedValue={getCurrentTab()}
        onTabSelect={handleTabSelect}
      >
        <Tab value="/dashboard" icon={<Home24Regular />}>
          Dashboard
        </Tab>
        <Tab value="/tasks" icon={<Checkmark24Regular />}>
          Tasks
        </Tab>
        <Tab value="/processor" icon={<Document24Regular />}>
          Process Transcript
        </Tab>
      </TabList>
    </div>
  );
}

export default Navbar;