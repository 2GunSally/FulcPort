import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, UserPlus, Key, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { User, DEPARTMENTS } from '@/types/maintenance';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAppContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    initials: '',
    role: 'employee' as const,
    department: '',
    permissions: [] as string[],
    password: ''
  });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.initials || !newUser.department || !newUser.password) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      initials: newUser.initials,
      role: newUser.role,
      department: newUser.department,
      permissions: newUser.permissions,
      password: newUser.password,
      createdAt: new Date()
    };

    try {
      await supabase.from('users').insert([user]);
      addUser(user);
      setNewUser({ name: '', initials: '', role: 'employee', department: '', permissions: [], password: '' });
      setIsAddDialogOpen(false);
      toast({ title: 'Success', description: 'User added successfully' });
    } catch (error) {
      console.error('Add user error:', error);
      toast({ title: 'Error', description: 'Failed to add user', variant: 'destructive' });
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      await supabase.from('users').update(user).eq('id', user.id);
      updateUser(user);
      setEditingUser(null);
      toast({ title: 'Success', description: 'User updated successfully' });
    } catch (error) {
      console.error('Update user error:', error);
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || !passwordUser) return;
    
    const updatedUser = { ...passwordUser, password: newPassword };
    
    try {
      await supabase.from('users').update({ password: newPassword }).eq('id', passwordUser.id);
      updateUser(updatedUser);
      setPasswordUser(null);
      setNewPassword('');
      toast({ title: 'Success', description: 'Password updated successfully' });
    } catch (error) {
      console.error('Password update error:', error);
      toast({ title: 'Error', description: 'Failed to update password', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await supabase.from('users').delete().eq('id', userId);
      deleteUser(userId);
      toast({ title: 'Success', description: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'authorized': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="mb-4">User Management</CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-lg">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center text-sm text-gray-600">
          <span>Scroll for more options</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Initials</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.initials}</TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setPasswordUser(user)}>
                    <Key className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="initials">Initials</Label>
                <Input
                  id="initials"
                  value={newUser.initials}
                  onChange={(e) => setNewUser({ ...newUser, initials: e.target.value.toUpperCase() })}
                  placeholder="Enter initials"
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.filter(dept => dept !== 'All').map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="authorized">Authorized</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={editingUser.department} onValueChange={(value) => setEditingUser({ ...editingUser, department: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.filter(dept => dept !== 'All').map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={editingUser.role} onValueChange={(value: any) => setEditingUser({ ...editingUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="authorized">Authorized</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                  <Button onClick={() => handleUpdateUser(editingUser)}>Update</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Password Change Dialog */}
        {passwordUser && (
          <Dialog open={!!passwordUser} onOpenChange={() => setPasswordUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password for {passwordUser.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => { setPasswordUser(null); setNewPassword(''); }}>Cancel</Button>
                  <Button onClick={handlePasswordChange}>Update Password</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};