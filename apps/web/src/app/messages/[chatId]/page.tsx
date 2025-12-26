'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Send, Paperclip, Image as ImageIcon, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat } = useQuery({
    queryKey: ['chat', params.chatId],
    queryFn: () => api.getChat(params.chatId as string),
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', params.chatId],
    queryFn: () => api.getMessages(params.chatId as string),
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      api.sendMessage(params.chatId as string, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', params.chatId] });
      setMessage('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUser = chat?.data?.participants?.find(
    (p: any) => p.id !== user?.userId
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Chat Header */}
      <div className="border-b p-4">
        <div className="container flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {otherUser?.name?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{otherUser?.name || 'User'}</h2>
            {isTyping && (
              <p className="text-sm text-muted-foreground">typing...</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container max-w-4xl space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : messages?.data?.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            messages?.data?.map((msg: Message) => {
              const isOwn = msg.senderId === user?.userId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {formatRelativeTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="container max-w-4xl">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Smile className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
