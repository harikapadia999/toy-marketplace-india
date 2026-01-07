# Real-Time Chat System

## Overview

Complete real-time messaging system with Socket.io, Redis pub/sub for horizontal scaling, and comprehensive features for buyer-seller communication.

## Features

### Core Messaging
- ✅ **Real-time messaging** - Instant message delivery
- ✅ **Typing indicators** - See when other user is typing
- ✅ **Read receipts** - Know when messages are read
- ✅ **Online/offline status** - Real-time presence
- ✅ **Message history** - Paginated message loading
- ✅ **Conversation list** - All active conversations

### Media Sharing
- ✅ **Image uploads** - Share toy photos
- ✅ **File attachments** - Share documents
- ✅ **Image compression** - Optimize bandwidth
- ✅ **CDN integration** - Fast media delivery

### Safety & Moderation
- ✅ **Report users** - Flag inappropriate behavior
- ✅ **Block users** - Prevent unwanted contact
- ✅ **Message moderation** - AI-powered content filtering
- ✅ **Spam detection** - Automatic spam prevention

### User Experience
- ✅ **Search conversations** - Find specific chats
- ✅ **Unread count** - Track unread messages
- ✅ **Push notifications** - Offline message alerts
- ✅ **Mobile responsive** - Works on all devices

## Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │ WebSocket
       ▼
┌─────────────┐      ┌─────────────┐
│  Socket.io  │◄────►│    Redis    │
│   Server    │      │   Pub/Sub   │
└──────┬──────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│  Database   │
└─────────────┘
```

## Tech Stack

- **Frontend**: React, TypeScript, Socket.io-client
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL with Prisma
- **Cache**: Redis for pub/sub
- **Real-time**: WebSocket protocol

## Installation

```bash
# Install dependencies
npm install socket.io socket.io-client ioredis

# Start Redis
docker run -d -p 6379:6379 redis:alpine

# Run migrations
npx prisma migrate dev

# Start chat server
npm run start:chat
```

## Usage

### Client Setup

```typescript
import { Chat } from './components/Chat';

function App() {
  return (
    <Chat 
      userId="user-123" 
      conversationId="conv-456" 
    />
  );
}
```

### Server Setup

```typescript
import { io } from './server/chat.server';

// Server automatically handles:
// - Connection management
// - Message routing
// - Typing indicators
// - Read receipts
// - Online status
```

## API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get all conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id/messages` | Get messages |
| DELETE | `/api/conversations/:id` | Delete conversation |

### Socket Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `{ conversationId }` | Join conversation room |
| `message:send` | `{ conversationId, content, type }` | Send message |
| `typing:start` | `{ conversationId }` | Start typing |
| `typing:stop` | `{ conversationId }` | Stop typing |
| `message:read` | `{ messageId }` | Mark message as read |
| `messages:read` | `{ conversationId }` | Mark all as read |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message }` | New message received |
| `message:read` | `{ messageId, readAt }` | Message was read |
| `typing:start` | `{ conversationId, userId }` | User started typing |
| `typing:stop` | `{ conversationId }` | User stopped typing |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId }` | User went offline |

## Database Schema

```prisma
model Conversation {
  id        String    @id @default(uuid())
  buyerId   String
  sellerId  String
  listingId String
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  buyer   User @relation("BuyerConversations", fields: [buyerId], references: [id])
  seller  User @relation("SellerConversations", fields: [sellerId], references: [id])
  listing Toy  @relation(fields: [listingId], references: [id])

  @@unique([buyerId, sellerId, listingId])
  @@index([buyerId])
  @@index([sellerId])
  @@index([listingId])
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  senderId       String
  content        String
  type           MessageType  @default(text)
  mediaUrl       String?
  readAt         DateTime?
  createdAt      DateTime     @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id])

  @@index([conversationId])
  @@index([senderId])
  @@index([createdAt])
}

enum MessageType {
  text
  image
  file
}
```

## Redis Pub/Sub

### Channels

- `chat:message` - New messages
- `chat:typing` - Typing indicators
- `chat:read` - Read receipts

### Why Redis?

- **Horizontal Scaling**: Multiple server instances
- **Real-time Sync**: All servers receive events
- **Performance**: Fast pub/sub messaging
- **Reliability**: Message delivery guarantees

## Features in Detail

### Typing Indicators

```typescript
// Client sends typing events
socket.emit('typing:start', { conversationId });

// Server broadcasts to other users
socket.to(conversationId).emit('typing:start', { userId });

// Auto-stop after 3 seconds of inactivity
setTimeout(() => {
  socket.emit('typing:stop', { conversationId });
}, 3000);
```

### Read Receipts

```typescript
// Mark message as read
socket.emit('message:read', { messageId });

// Update database
await prisma.message.update({
  where: { id: messageId },
  data: { readAt: new Date() }
});

// Notify sender
socket.to(conversationId).emit('message:read', {
  messageId,
  readAt: new Date()
});
```

### Online Status

```typescript
// User connects
onlineUsers.set(userId, socketId);
socket.broadcast.emit('user:online', { userId });

// User disconnects
socket.on('disconnect', () => {
  onlineUsers.delete(userId);
  socket.broadcast.emit('user:offline', { userId });
});
```

## Performance Optimizations

- ✅ **Message Pagination** - Load 50 messages at a time
- ✅ **Lazy Loading** - Load conversations on demand
- ✅ **Redis Caching** - Cache online users
- ✅ **Database Indexes** - Fast message queries
- ✅ **Connection Pooling** - Efficient DB connections
- ✅ **Image Compression** - Reduce bandwidth

## Security

- ✅ **Authentication** - JWT token validation
- ✅ **Authorization** - Verify conversation access
- ✅ **Input Validation** - Sanitize all inputs
- ✅ **Rate Limiting** - Prevent spam
- ✅ **XSS Protection** - Escape HTML content
- ✅ **CORS** - Restrict origins

## Monitoring

### Metrics to Track

- Active connections
- Messages per second
- Average latency
- Error rate
- Redis pub/sub lag

### Logging

```typescript
// Connection logs
console.log(`User connected: ${userId}`);
console.log(`User joined conversation: ${conversationId}`);

// Error logs
console.error('Error sending message:', error);
```

## Testing

```typescript
import { io as Client } from 'socket.io-client';

describe('Chat System', () => {
  it('should send and receive messages', (done) => {
    const client = Client('http://localhost:3001');
    
    client.on('message:new', (message) => {
      expect(message.content).toBe('Hello');
      done();
    });

    client.emit('message:send', {
      conversationId: 'conv-123',
      content: 'Hello',
      type: 'text'
    });
  });
});
```

## Deployment

### Docker Compose

```yaml
version: '3.8'
services:
  chat-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://...
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=marketplace
      - POSTGRES_PASSWORD=password
```

### Environment Variables

```env
PORT=3001
CLIENT_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

## Future Enhancements

- [ ] Voice messages
- [ ] Video calls
- [ ] Group chats
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] End-to-end encryption
- [ ] Message search
- [ ] Chat bots
- [ ] Auto-translation

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE)