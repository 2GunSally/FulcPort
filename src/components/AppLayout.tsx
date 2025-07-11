
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import LoginForm from './LoginForm';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import ChecklistsView from './ChecklistsView';
import RequestsView from './RequestsView';
import MessagesView from './MessagesView';
import AlertsView from './AlertsView';
import { AdminPanel } from './AdminPanel';
import { Button } from '@/components/ui/button';
import { Menu, ArrowLeft } from 'lucide-react';

const AppLayout: React.FC = () => {
  const {
    user,
    checklists,
    requests,
    selectedDepartment,
    currentView,
    login,
    logout,
    setSelectedDepartment,
    setCurrentView,
    toggleChecklistItem,
    startChecklist,
    completeChecklist,
    addMaintenanceRequest,
    updateRequest,
    loading
  } = useAppContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['dashboard']);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      handleBackNavigation();
    };

    // Push initial state
    window.history.pushState({ view: 'dashboard' }, '', window.location.href);
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update history when view changes
  useEffect(() => {
    if (currentView !== navigationHistory[navigationHistory.length - 1]) {
      const newHistory = [...navigationHistory, currentView];
      setNavigationHistory(newHistory);
      window.history.pushState({ view: currentView }, '', window.location.href);
    }
  }, [currentView]);

  const handleBackNavigation = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousView = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentView(previousView);
    } else {
      setCurrentView('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-700 text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  const handleDepartmentSelect = (dept: string) => {
    setSelectedDepartment(dept);
    setCurrentView('checklists');
  };

  const canAccessAdmin = user.role === 'admin' || user.role === 'authorized';
  const showBackButton = currentView !== 'dashboard';

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-gray-100">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`
        fixed lg:relative z-50 h-full transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          user={user}
          selectedDepartment={selectedDepartment}
          onDepartmentSelect={handleDepartmentSelect}
          onViewChange={setCurrentView}
          currentView={currentView}
          onLogout={logout}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-green-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68480378222801c72b3f15e0_1750746200893_a8270471.png" 
              alt="Fulcrum Technologies" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-800">{user.name}</div>
            <div className="text-sm text-gray-600 capitalize">{user.role}</div>
          </div>
        </header>
        
        {/* Light green area with back button */}
        {showBackButton && (
          <div className="bg-green-100 px-6 py-2 border-b border-green-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackNavigation}
              className="flex items-center space-x-1 text-green-700 hover:text-green-800 hover:bg-green-200 p-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="text-xs">Back</span>
            </Button>
          </div>
        )}
        
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' && (
              <Dashboard 
                onViewChecklists={() => setCurrentView('checklists')}
                onViewRequests={() => setCurrentView('requests')}
                onViewMessages={() => setCurrentView('messages')}
                onViewAlerts={() => setCurrentView('alerts')}
                onViewAdmin={canAccessAdmin ? () => setCurrentView('admin') : undefined}
              />
            )}
            
            {currentView === 'messages' && <MessagesView />}
            {currentView === 'alerts' && <AlertsView />}
            
            {currentView === 'checklists' && (
              <ChecklistsView
                checklists={checklists}
                user={user}
                onItemToggle={toggleChecklistItem}
                onStartChecklist={startChecklist}
                onCompleteChecklist={completeChecklist}
              />
            )}
            
            {currentView === 'requests' && (
              <RequestsView
                requests={requests}
                user={user}
                onAddRequest={addMaintenanceRequest}
                onUpdateRequest={updateRequest}
              />
            )}
            
            {currentView === 'admin' && canAccessAdmin && (
              <AdminPanel />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;