import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import RequestDetailModal from './RequestDetailModal';
import EditRequestModal from './EditRequestModal';
import { MaintenanceRequest, User } from '@/types/maintenance';

interface RequestsViewProps {
  requests: MaintenanceRequest[];
  user: User;
  onAddRequest: (requestData: any) => void;
  onUpdateRequest?: (requestData: MaintenanceRequest) => void;
}

const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  user,
  onAddRequest,
  onUpdateRequest
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const departments = ['All Departments', ...Array.from(new Set(requests.map(r => r.department)))];
  const priorities = ['All Priorities', 'High', 'Medium', 'Low'];
  const statuses = ['All Statuses', 'Open', 'In Progress', 'Completed'];

  const filteredRequests = requests.filter(request => {
    const deptMatch = selectedDepartment === 'All Departments' || request.department === selectedDepartment;
    const priorityMatch = selectedPriority === 'All Priorities' || request.priority === selectedPriority.toLowerCase();
    const statusMatch = selectedStatus === 'All Statuses' || request.status === selectedStatus.toLowerCase().replace(' ', '-');
    return deptMatch && priorityMatch && statusMatch;
  });

  const handleTitleClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleNewRequest = () => {
    setSelectedRequest(null);
    setIsCreating(true);
    setShowEditModal(true);
  };

  const handleSaveRequest = (requestData: MaintenanceRequest) => {
    if (isCreating) {
      onAddRequest(requestData);
    } else {
      onUpdateRequest?.(requestData);
    }
    setShowEditModal(false);
    setIsCreating(false);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Request Management</h1>
          <p className="text-gray-400">Submit and track maintenance requests</p>
        </div>
        <Button 
          onClick={handleNewRequest}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FilterDropdown
          label="Department"
          value={selectedDepartment}
          options={departments}
          onChange={setSelectedDepartment}
        />
        <FilterDropdown
          label="Priority"
          value={selectedPriority}
          options={priorities}
          onChange={setSelectedPriority}
        />
        <FilterDropdown
          label="Status"
          value={selectedStatus}
          options={statuses}
          onChange={setSelectedStatus}
        />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No requests match the selected filters</p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div 
              key={request.id} 
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 
                  className="font-semibold text-white cursor-pointer hover:text-blue-400 hover:underline"
                  onClick={() => handleTitleClick(request)}
                >
                  {request.title}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  request.priority === 'high' ? 'bg-red-500 text-white' :
                  request.priority === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-white'
                }`}>
                  {request.priority?.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 mb-3">{request.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{request.department}</span>
                <span className="text-gray-400">
                  {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <RequestDetailModal
        request={selectedRequest}
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
      
      <EditRequestModal
        request={selectedRequest}
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setIsCreating(false);
        }}
        onSave={handleSaveRequest}
        isCreating={isCreating}
      />
    </div>
  );
};

export default RequestsView;