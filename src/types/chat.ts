export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'gradus';
  timestamp: Date;
  status?: 'sending' | 'delivered' | 'error';
  actions?: Array<{
    label: string;
    action: string;
  }>;
  isEditing?: boolean;
}

export interface ChatHistory {
  chats: Chat[];
  currentChatId: string | null;
}
