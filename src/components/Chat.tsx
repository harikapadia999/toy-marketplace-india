import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Send, Paperclip, Image, Smile, MoreVertical, Phone, Video, Search } from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  readAt?: Date;
  createdAt: Date;
}

interface Conversation {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  listing: {
    title: string;
    price: number;
    image: string;
  };
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatProps {
  userId: string;
  conversationId?: string;
}

export const Chat: React.FC<ChatProps> = ({ userId, conversationId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: { userId },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('message:new', (message: Message) => {
      if (message.conversationId === activeConversation?.id) {
        setMessages((prev) => [...prev, message]);
        newSocket.emit('message:read', { messageId: message.id });
      }
      updateConversationLastMessage(message);
    });

    newSocket.on('message:read', ({ messageId, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, readAt: new Date(readAt) } : msg))
      );
    });

    newSocket.on('typing:start', ({ conversationId: convId, userId: typingUserId }) => {
      if (convId === activeConversation?.id && typingUserId !== userId) {
        setOtherUserTyping(true);
      }
    });

    newSocket.on('typing:stop', ({ conversationId: convId }) => {
      if (convId === activeConversation?.id) {
        setOtherUserTyping(false);
      }
    });

    newSocket.on('user:online', ({ userId: onlineUserId }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.otherUser.id === onlineUserId
            ? { ...conv, otherUser: { ...conv.otherUser, online: true } }
            : conv
        )
      );
    });

    newSocket.on('user:offline', ({ userId: offlineUserId }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.otherUser.id === offlineUserId
            ? { ...conv, otherUser: { ...conv.otherUser, online: false } }
            : conv
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || !socket) return;

    const message = {
      conversationId: activeConversation.id,
      senderId: userId,
      content: messageInput,
      type: 'text' as const,
    };

    const tempMessage: Message = {
      ...message,
      id: `temp-${Date.now()}`,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput('');

    socket.emit('message:send', message);
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!socket || !activeConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { conversationId: activeConversation.id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    if (!socket || !activeConversation) return;
    setIsTyping(false);
    socket.emit('typing:stop', { conversationId: activeConversation.id });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const updateConversationLastMessage = (message: Message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? {
              ...conv,
              lastMessage: message,
              unreadCount:
                message.senderId !== userId ? conv.unreadCount + 1 : conv.unreadCount,
            }
          : conv
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-3">Messages</h2>
        </div>
      </div>
    </div>
  );
};