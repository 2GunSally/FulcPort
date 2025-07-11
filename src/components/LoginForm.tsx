import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/maintenance';
import { toast } from '@/components/ui/use-toast';
import { useSupabase } from '@/contexts/SupabaseContext';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loadUsers } = useSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const users = await loadUsers();
      const user = users.find(u => 
        u.name.toLowerCase() === username.toLowerCase() ||
        u.initials.toLowerCase() === username.toLowerCase()
      );
      
      if (user && password === 'password123') {
        onLogin(user);
        setTimeout(() => {
          toast({ 
            title: `Welcome, ${user.name}!`,
            className: "fixed bottom-4 right-4 z-50"
          });
        }, 100);
      } else if (user) {
        setError('Incorrect password');
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (e.target.value.trim()) {
      setShowPassword(true);
    } else {
      setShowPassword(false);
      setPassword('');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-gray-50 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68480378222801c72b3f15e0_1750746200893_a8270471.png" 
              alt="Fulcrum Technologies" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Maintenance Portal
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Sign in to access maintenance checklists
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-700">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter your username"
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                disabled={loading}
              />
            </div>
            
            {showPassword && (
              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  disabled={loading}
                />
              </div>
            )}
            
            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!username.trim() || loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;