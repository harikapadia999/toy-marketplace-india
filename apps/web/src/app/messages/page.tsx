'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MessageCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.getChats(),
  });

  const filteredChats = chats?.data?.filter((chat: any) =>
    chat.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Chat List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
            <p className="text-muted-foreground mt-2">
              Start a conversation with a seller!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats?.map((chat: any) => {
              const otherUser = chat.participants?.find(
                (p: any) => p.id !== user?.userId
              );
              const lastMessage = chat.lastMessage;

              return (
                <Link
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {otherUser?.name?.[0] || 'U'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold truncate">
                          {otherUser?.name || 'User'}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {lastMessage?.createdAt &&
                            formatRelativeTime(lastMessage.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {chat.unreadCount > 0 && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
