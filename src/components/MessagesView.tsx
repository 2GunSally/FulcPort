import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { Message } from '@/types/maintenance';
import { MessageCircle, Plus, Search, Send, X } from 'lucide-react';
import ConversationView from './ConversationView';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

const MessagesView: React.FC = () => {
  const { user, users } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<{[key: string]: Message[]}>({});
  const [newMessage, setNewMessage] = useState({ 
    subject: '', 
    content: '', 
    to: [] as string[]
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [user]);

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_ids.cs.{${user.id}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupedMessages: {[key: string]: Message[]} = {};
      
      data?.forEach(msg => {
        const conversationKey = msg.thread_id || msg.id;
        if (!groupedMessages[conversationKey]) {
          groupedMessages[conversationKey] = [];
        }
        
        const message: Message = {
          id: msg.id,
          subject: msg.subject,
          content: msg.content,
          from: msg.sender_name,
          to: msg.recipient_names,
          type: msg.message_type,
          read: msg.is_read,
          createdAt: new Date(msg.created_at),
          threadId: msg.thread_id,
          imageUrl: msg.image_url
        };
        
        groupedMessages[conversationKey].push(message);
      });
      
      Object.keys(groupedMessages).forEach(key => {
        groupedMessages[key].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      });
      
      setConversations(groupedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({ title: 'Error loading messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.subject || !newMessage.content || newMessage.to.length === 0 || !user) {
      return;
    }

    try {
      const recipientUsers = users.filter(u => newMessage.to.includes(u.name));
      const recipientIds = recipientUsers.map(u => u.id);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          subject: newMessage.subject,
          content: newMessage.content,
          sender_id: user.id,
          sender_name: user.name,
          recipient_ids: recipientIds,
          recipient_names: newMessage.to,
          message_type: 'general'
        });

      if (error) throw error;

      toast({ title: 'Message sent successfully' });
      setNewMessage({ subject: '', content: '', to: [] });
      setIsDialogOpen(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Error sending message', variant: 'destructive' });
    }
  };

  const handleSendReply = async (content: string, imageUrl?: string) => {
    if (!selectedConversation || !user) return;
    
    const conversationMessages = conversations[selectedConversation];
    if (!conversationMessages || conversationMessages.length === 0) return;
    
    const originalMessage = conversationMessages[0];
    const allParticipants = [originalMessage.from, ...originalMessage.to];
    const otherParticipants = allParticipants.filter(name => name !== user.name);
    
    try {
      const recipientUsers = users.filter(u => otherParticipants.includes(u.name));
      const recipientIds = recipientUsers.map(u => u.id);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          subject: originalMessage.subject,
          content: content,
          sender_id: user.id,
          sender_name: user.name,
          recipient_ids: recipientIds,
          recipient_names: otherParticipants,
          message_type: 'general',
          thread_id: selectedConversation,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;
      
      // Immediately add the new message to the conversation
      const newMessage: Message = {
        id: data.id,
        subject: data.subject,
        content: data.content,
        from: data.sender_name,
        to: data.recipient_names,
        type: data.message_type,
        read: data.is_read,
        createdAt: new Date(data.created_at),
        threadId: data.thread_id,
        imageUrl: data.image_url
      };
      
      setConversations(prev => ({
        ...prev,
        [selectedConversation]: [...prev[selectedConversation], newMessage]
      }));
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ title: 'Error sending reply', variant: 'destructive' });
    }
  };

  const filteredConversations = Object.entries(conversations).filter(([key, messages]) => {
    const firstMessage = messages[0];
    return firstMessage.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           firstMessage.content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (selectedConversation && conversations[selectedConversation]) {
    return (
      <div className="h-full">
        <ConversationView
          messages={conversations[selectedConversation]}
          currentUser={user!}
          onBack={() => setSelectedConversation(null)}
          onSendMessage={handleSendReply}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">Send Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">Recipients *</Label>
                <div className="space-y-2">
                  {newMessage.to.map(recipient => (
                    <div key={recipient} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-flex items-center mr-2">
                      {recipient}
                      <button 
                        onClick={() => setNewMessage(prev => ({...prev, to: prev.to.filter(r => r !== recipient)}))}
                        className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <select 
                    onChange={(e) => {
                      if (e.target.value && !newMessage.to.includes(e.target.value)) {
                        setNewMessage(prev => ({...prev, to: [...prev.to, e.target.value]}));
                      }
                      e.target.value = '';
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select recipients...</option>
                    {users.filter(u => u.id !== user?.id && !newMessage.to.includes(u.name)).map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-gray-700 font-medium">Subject *</Label>
                <Input
                  placeholder="Message subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-medium">Message *</Label>
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.subject || !newMessage.content || newMessage.to.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-white">Loading messages...</div>
        ) : filteredConversations.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map(([key, messages]) => {
            const firstMessage = messages[0];
            const lastMessage = messages[messages.length - 1];
            const unreadCount = messages.filter(m => !m.read && m.from !== user?.name).length;
            
            return (
              <Card 
                key={key} 
                className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                onClick={() => setSelectedConversation(key)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-gray-500" />
                      <CardTitle className="text-lg text-gray-900">{firstMessage.subject}</CardTitle>
                      {unreadCount > 0 && (
                        <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                      )}
                      {messages.length > 1 && (
                        <Badge variant="outline">{messages.length} messages</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2 line-clamp-2">{lastMessage.content}</p>
                  <div className="text-sm text-gray-500">
                    Last from: {lastMessage.from} • {lastMessage.createdAt.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesView;