import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChecklistCard from './ChecklistCard';
import FilterDropdown from './FilterDropdown';
import { Checklist, User } from '@/types/maintenance';
import { useAppContext } from '@/contexts/AppContext';

interface ChecklistsViewProps {
  checklists: Checklist[];
  user: User;
  onItemToggle: (checklistId: string, itemId: string) => void;
  onStartChecklist: (checklistId: string) => void;
  onCompleteChecklist: (checklistId: string) => void;
}

const ChecklistsView: React.FC<ChecklistsViewProps> = ({
  checklists,
  user,
  onItemToggle,
  onStartChecklist,
  onCompleteChecklist
}) => {
  const navigate = useNavigate();
  const { selectedDepartment } = useAppContext();
  const [localSelectedDepartment, setLocalSelectedDepartment] = React.useState('All Departments');
  const [selectedFrequency, setSelectedFrequency] = React.useState('All Frequencies');

  React.useEffect(() => {
    if (selectedDepartment && selectedDepartment !== 'All') {
      setLocalSelectedDepartment(selectedDepartment);
    }
  }, [selectedDepartment]);

  const safeChecklists = React.useMemo(() => {
    if (!Array.isArray(checklists)) return [];
    return checklists.filter(checklist => {
      return checklist && 
             typeof checklist === 'object' && 
             checklist.id && 
             checklist.title;
    });
  }, [checklists]);
  
  const departments = React.useMemo(() => {
    const depts = ['All Departments'];
    safeChecklists.forEach(c => {
      if (c.department && !depts.includes(c.department)) {
        depts.push(c.department);
      }
    });
    return depts;
  }, [safeChecklists]);
  
  const frequencies = ['All Frequencies', 'Daily', 'Weekly', 'Monthly'];

  const filteredChecklists = React.useMemo(() => {
    return safeChecklists.filter(checklist => {
      const deptMatch = localSelectedDepartment === 'All Departments' || 
                       checklist.department === localSelectedDepartment;
      const freqMatch = selectedFrequency === 'All Frequencies' || 
                       checklist.frequency === selectedFrequency.toLowerCase();
      return deptMatch && freqMatch;
    });
  }, [safeChecklists, localSelectedDepartment, selectedFrequency]);

  const canCreateChecklists = user && (user.role === 'admin' || user.role === 'authorized');

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Maintenance Checklists</h1>
          <p className="text-gray-400">
            {localSelectedDepartment !== 'All Departments' 
              ? `${localSelectedDepartment} Department - Manage and track maintenance tasks`
              : 'Manage and track maintenance tasks'
            }
          </p>
        </div>
        {canCreateChecklists && (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => navigate('/create-checklist')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Checklist
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FilterDropdown
          label="Department"
          value={localSelectedDepartment}
          options={departments}
          onChange={setLocalSelectedDepartment}
        />
        <FilterDropdown
          label="Frequency"
          value={selectedFrequency}
          options={frequencies}
          onChange={setSelectedFrequency}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChecklists.map(checklist => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            user={user}
            onItemToggle={onItemToggle}
            onStartChecklist={onStartChecklist}
            onCompleteChecklist={onCompleteChecklist}
          />
        ))}
      </div>

      {filteredChecklists.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No checklists available</p>
          {safeChecklists.length === 0 && (
            <p className="mt-2 text-sm">Try creating your first checklist or check your database connection.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChecklistsView;