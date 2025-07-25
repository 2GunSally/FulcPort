import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { Message, User } from '@/types/maintenance';
import ImageUploadButton from './ImageUploadButton';
import ImageMarkupEditor from './ImageMarkupEditor';

interface ConversationViewProps {
  messages: Message[];
  currentUser: User;
  onBack: () => void;
  onSendMessage: (content: string, imageUrl?: string) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  messages,
  currentUser,
  onBack,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImageForEditing, setTempImageForEditing] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (newMessage.trim() || selectedImage) {
      onSendMessage(newMessage.trim(), selectedImage || undefined);
      setNewMessage('');
      setSelectedImage('');
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg">
      <div className="flex items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">
          {messages[0]?.subject || 'Conversation'}
        </h2>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isFromCurrentUser = message.from === currentUser.name;
            return (
              <div
                key={message.id || `temp-${index}-${message.createdAt.getTime()}`}
                className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[70%] ${
                    isFromCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-green-100 text-gray-900'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium mb-1">
                      {message.from}
                    </div>
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Attachment" 
                          className="max-w-full h-auto rounded border"
                        />
                      </div>
                    )}
                    {message.content && (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {message.createdAt.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-700">
        {selectedImage && (
          <div className="mb-2 p-2 bg-gray-800 rounded">
            <img src={selectedImage} alt="Selected" className="max-h-20 rounded" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedImage('')}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </Button>
          </div>
        )}
        <div className="flex space-x-2">
          <ImageUploadButton onImageSelect={handleImageSelect} />
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[60px] bg-white border-gray-300 resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() && !selectedImage}
            className="bg-green-600 hover:bg-green-700 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
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

export default ConversationView;