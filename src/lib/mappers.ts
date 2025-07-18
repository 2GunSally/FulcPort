import { Message } from '@/types/maintenance';

export interface DbMessage {
  id: string;
  subject: string;
  content: string;
  sender_id: string;
  sender_name: string;
  recipient_ids: string[];
  recipient_names: string[];
  message_type: 'request' | 'checklist' | 'general';
  is_read: boolean;
  thread_id?: string;
  image_url?: string;
  created_at: string;
}

export const toDomainMessage = (row: DbMessage): Message => ({
  id: row.id,
  subject: row.subject,
  content: row.content,
  from: row.sender_name,
  to: row.recipient_names,
  type: row.message_type as Message['type'],
  read: row.is_read,
  createdAt: new Date(row.created_at),
  threadId: row.thread_id ?? undefined,
  imageUrl: row.image_url ?? undefined
});

export const toDbMessage = (
  m: { subject: string; content: string; from: string; to: string[]; type: Message['type']; senderId: string; recipientIds: string[]; threadId?: string; imageUrl?: string; }
): Omit<DbMessage, 'id' | 'created_at' | 'is_read'> => ({
  subject: m.subject,
  content: m.content,
  sender_id: m.senderId,
  sender_name: m.from,
  recipient_ids: m.recipientIds,
  recipient_names: m.to,
  message_type: m.type,
  thread_id: m.threadId ?? null,
  image_url: m.imageUrl ?? null
});
