import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { Message } from '@/types/maintenance';
import { MessageCircle, Plus, Search, Send, X, Trash2 } from 'lucide-react';
import ConversationView from './ConversationView';
import ImageUploadButton from './ImageUploadButton';
import ImageMarkupEditor from './ImageMarkupEditor';
import { uploadImageFromDataURL } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

interface MessagesViewProps {
  onRegisterBackHandler?: (handler: () => boolean) => void;
  onUnregisterBackHandler?: () => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ 
  onRegisterBackHandler,
  onUnregisterBackHandler 
}) => {
  const { user, users, messages, addMessage } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  // Register/unregister back handler when entering/leaving conversation
  useEffect(() => {
    if (selectedConversation && onRegisterBackHandler) {
      // Push a new history state when entering a conversation
      window.history.pushState({ 
        view: 'messages', 
        conversation: selectedConversation 
      }, '', window.location.href);
      
      const backHandler = () => {
        setSelectedConversation(null);
        return true; // Handled
      };
      onRegisterBackHandler(backHandler);
      
      return () => {
        if (onUnregisterBackHandler) {
          onUnregisterBackHandler();
        }
      };
    } else if (!selectedConversation && onUnregisterBackHandler) {
      // Clean up when leaving conversation
      onUnregisterBackHandler();
    }
  }, [selectedConversation, onRegisterBackHandler, onUnregisterBackHandler]);
  const [conversations, setConversations] = useState<{[key: string]: Message[]}>({});
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState({ 
    subject: '', 
    content: '', 
    to: [] as string[]
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageForEditing, setTempImageForEditing] = useState<string>('');

  useEffect(() => {
    loadMessages();
  }, [user]);

  // Update conversations when messages change
  useEffect(() => {
    if (loadedMessages.length > 0) {
      const groupedMessages: {[key: string]: Message[]} = {};
      
      loadedMessages.forEach(msg => {
        const conversationKey = msg.threadId || msg.id;
        if (!groupedMessages[conversationKey]) {
          groupedMessages[conversationKey] = [];
        }
        groupedMessages[conversationKey].push(msg);
      });
      
      Object.keys(groupedMessages).forEach(key => {
        groupedMessages[key].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      });
      
      setConversations(groupedMessages);
    }
  }, [loadedMessages]);

  const loadMessages = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Loading messages for user:', user.id);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_ids.cs.{${user.id}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Loaded messages data:', data);
      console.log('Number of messages found:', data?.length || 0);

      const messages: Message[] = [];
      
      data?.forEach(msg => {
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
        
        messages.push(message);
      });
      
      setLoadedMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({ title: 'Error loading messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.subject || !newMessage.content) && !selectedImage || newMessage.to.length === 0 || !user) {
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
          message_type: 'general',
          image_url: selectedImage || null
        });

      if (error) throw error;

      // Create the message object for local state
      const newMessageObj: Message = {
        id: Math.random().toString(36).substr(2, 9), // Temporary ID
        subject: newMessage.subject,
        content: newMessage.content,
        from: user.name,
        to: newMessage.to,
        type: 'general',
        read: false,
        createdAt: new Date(),
        imageUrl: selectedImage || undefined
      };
      
      // Add to AppContext
      await addMessage(newMessageObj);
      
      toast({ title: 'Message sent successfully' });
      setNewMessage({ subject: '', content: '', to: [] });
      setSelectedImage('');
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
      
      // Immediately add the new message to local state
      const replyMessage: Message = {
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
      
      // Add to AppContext
      await addMessage(replyMessage);
      
      // Update local messages state
      setLoadedMessages(prev => [...prev, replyMessage]);
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({ title: 'Error sending reply', variant: 'destructive' });
    }
  };

  const handleDeleteThread = async (threadKey: string) => {
    try {
      const threadMessages = conversations[threadKey];
      if (!threadMessages || threadMessages.length === 0) return;

      // Delete all messages in the thread
      const messageIds = threadMessages.map(msg => msg.id);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', messageIds);

      if (error) throw error;

      // Remove the conversation from local state
      setConversations(prev => {
        const updated = { ...prev };
        delete updated[threadKey];
        return updated;
      });

      toast({ title: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast({ title: 'Error deleting conversation', variant: 'destructive' });
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setTempImageForEditing(imageUrl);
    setShowImageEditor(true);
  };

  const handleImageSave = (editedImageUrl: string) => {
    setSelectedImage(editedImageUrl);
    setShowImageEditor(false);
    setTempImageForEditing('');
  };

  const handleImageCancel = () => {
    setShowImageEditor(false);
    setTempImageForEditing('');
  };

  const removeSelectedImage = () => {
    setSelectedImage('');
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
                <Label className="text-gray-700 font-medium">Message</Label>
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              <div>
                <Label className="text-gray-700 font-medium">Attachment</Label>
                <div className="mt-2 space-y-2">
                  <ImageUploadButton onImageSelect={handleImageSelect} />
                  {selectedImage && (
                    <div className="relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="max-w-xs max-h-32 object-contain border rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeSelectedImage}
                        className="absolute top-1 right-1 p-1 h-6 w-6"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={((!newMessage.subject || !newMessage.content) && !selectedImage) || newMessage.to.length === 0}
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
            
            // Get all participants in the conversation
            const allParticipants = new Set<string>();
            messages.forEach(msg => {
              allParticipants.add(msg.from);
              msg.to.forEach(recipient => allParticipants.add(recipient));
            });
            const otherParticipants = Array.from(allParticipants).filter(name => name !== user?.name);
            
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this entire conversation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteThread(key)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2 line-clamp-2">{lastMessage.content}</p>
                  <div className="text-sm text-gray-500">
                    <div>Participants: {otherParticipants.join(', ')}</div>
                    <div>Last from: {lastMessage.from} • {lastMessage.createdAt.toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Image Markup Editor */}
      {showImageEditor && tempImageForEditing && (
        <ImageMarkupEditor
          imageUrl={tempImageForEditing}
          onSave={handleImageSave}
          onCancel={handleImageCancel}
        />
      )}
    </div>
  );
};

export default MessagesView;