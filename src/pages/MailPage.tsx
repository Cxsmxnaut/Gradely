import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Search,
  ArrowLeft,
  Paperclip,
  Send,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Message } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { StudentAccount } from '@/lib/synergy';
import type { 
  MailData, 
  InboxItemListingsMessageXML, 
  SentItemListingsMessageXML,
  AttachmentsClass,
  AttachmentXML 
} from '@/lib/types/MailData';

export function MailPage() {
  const { user, credentials } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState({
    to: '',
    subject: '',
    body: '',
  });

  // Fetch mail from StudentVUE API
  useEffect(() => {
    const fetchMail = async () => {
      if (!credentials) {
        console.log('🔍 Mail: No credentials found in AuthContext');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Mail: Starting fetch with credentials:', {
          districtUrl: credentials.districtUrl,
          username: credentials.username
        });

        const studentAccount = new StudentAccount(
          credentials.districtUrl,
          credentials.username,
          credentials.password
        );

        console.log('🔍 Mail: Created StudentAccount, calling mailData()...');
        const mailData = await studentAccount.mailData();
        console.log('🔍 Mail data from StudentVUE:', mailData);

        // Check if mailData exists and has the expected structure
        if (!mailData) {
          console.log('🔍 Mail: No mail data returned');
          setMessages([]);
          setLoading(false);
          return;
        }

        // Convert StudentVUE mail data to our Message format
        const convertedMessages: Message[] = [];

        // Process inbox messages
        if (mailData.InboxItemListings?.MessageXML) {
          const inboxMessages = Array.isArray(mailData.InboxItemListings.MessageXML) 
            ? mailData.InboxItemListings.MessageXML 
            : [mailData.InboxItemListings.MessageXML];

          console.log('🔍 Mail: Processing', inboxMessages.length, 'inbox messages');

          inboxMessages.forEach((msg: InboxItemListingsMessageXML, index: number) => {
            const fromName = typeof msg.From === 'string' ? msg.From : 
              msg.From?.RecipientXML?._Details2 || 
              msg.From?.RecipientXML?._RecipientList || 
              `Unknown ${index}`;

            convertedMessages.push({
              id: msg._SMMessageGU || `inbox-${index}`,
              from: fromName,
              subject: msg._Subject || 'No Subject',
              body: msg._MessageText || '',
              date: msg._SendDateTime || new Date().toISOString(),
              read: msg._MailRead === 'Y',
              attachments: processAttachments(msg.Attachments)
            });
          });
        } else {
          console.log('🔍 Mail: No inbox messages found');
        }

        // Process sent messages
        if (mailData.SentItemListings?.MessageXML) {
          const sentMessages = Array.isArray(mailData.SentItemListings.MessageXML) 
            ? mailData.SentItemListings.MessageXML 
            : [mailData.SentItemListings.MessageXML];

          console.log('🔍 Mail: Processing', sentMessages.length, 'sent messages');

          sentMessages.forEach((msg: SentItemListingsMessageXML, index: number) => {
            const toName = typeof msg.To === 'string' ? msg.To : 
              msg.To?.RecipientXML?._Details2 || 
              msg.To?.RecipientXML?._RecipientList || 
              `Unknown ${index}`;

            convertedMessages.push({
              id: msg._SMMessageGU || `sent-${index}`,
              from: `To: ${toName}`,
              subject: msg._Subject || 'No Subject',
              body: msg._MessageText || '',
              date: msg._SendDateTime || new Date().toISOString(),
              read: true, // Sent messages are always read
              attachments: []
            });
          });
        } else {
          console.log('🔍 Mail: No sent messages found');
        }

        // Sort messages by date (newest first)
        convertedMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        console.log('🔍 Mail: Final converted messages:', convertedMessages);
        setMessages(convertedMessages);
      } catch (error) {
        console.error('🔍 Mail: Error fetching mail:', error);
        toast.error('Failed to load mail from StudentVUE: ' + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMail();
  }, [credentials]);

  // Helper function to process attachments
  const processAttachments = (attachments: AttachmentsClass | string): Message['attachments'] => {
    if (typeof attachments === 'string' || !attachments?.AttachmentXML) {
      return [];
    }

    const attachmentArray = Array.isArray(attachments.AttachmentXML) 
      ? attachments.AttachmentXML 
      : [attachments.AttachmentXML];

    return attachmentArray.map((att: AttachmentXML) => ({
      id: att._SmAttachmentGU,
      name: att._DocumentName,
      size: 'Unknown size'
    }));
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter((msg) => !msg.read).length;

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read
    if (!message.read) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, read: true } : msg
        )
      );
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.body) {
      toast.error('Please fill in all fields');
      return;
    }

    toast.success('Message sent!');
    setNewMessage({ to: '', subject: '', body: '' });
    setComposeDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mail</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>

        <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="size-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
              <DialogDescription>Send a new message to your teachers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>To</Label>
                <Input
                  placeholder="Recipient email or name"
                  value={newMessage.to}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, to: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Message subject"
                  value={newMessage.subject}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, subject: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage.body}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, body: e.target.value })
                  }
                  rows={8}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setComposeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="size-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbox List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="size-5" />
              Inbox
            </CardTitle>
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Loading mail from StudentVUE...
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedMessage?.id === message.id
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    } ${!message.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {message.read ? (
                          <MailOpen className="size-4 text-neutral-400" />
                        ) : (
                          <Mail className="size-4 text-primary" />
                        )}
                        <span
                          className={`text-sm ${
                            !message.read ? 'font-semibold' : 'font-medium'
                          }`}
                        >
                          {message.from}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 whitespace-nowrap">
                        {formatDate(message.date)}
                      </span>
                    </div>
                    <h3
                      className={`text-sm mb-1 line-clamp-1 ${
                        !message.read ? 'font-semibold' : ''
                      }`}
                    >
                      {message.subject}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                      {message.body}
                    </p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Paperclip className="size-3 text-neutral-500" />
                        <span className="text-xs text-neutral-500">
                          {message.attachments.length} attachment(s)
                        </span>
                      </div>
                    )}
                  </button>
                ))}

                {!loading && filteredMessages.length === 0 && (
                  <div className="text-center py-8">
                    <Mail className="size-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {messages.length === 0 ? 'No mail found in StudentVUE' : 'No messages found'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Content */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            {selectedMessage ? (
              <div>
                {/* Message Header */}
                <div className="flex items-start justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                    className="lg:hidden mb-4"
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    Back to Inbox
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Subject */}
                  <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>

                  {/* From/Date Info */}
                  <div className="flex items-center justify-between py-4 border-y border-neutral-200 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                          {selectedMessage.from.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{selectedMessage.from}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(selectedMessage.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!selectedMessage.read && (
                      <Badge variant="secondary">New</Badge>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="prose dark:prose-invert max-w-none py-6">
                    <p className="whitespace-pre-wrap">{selectedMessage.body}</p>
                  </div>

                  {/* Attachments */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Paperclip className="size-4" />
                        Attachments ({selectedMessage.attachments.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800"
                          >
                            <div className="flex items-center gap-3">
                              <Paperclip className="size-5 text-neutral-500" />
                              <div>
                                <p className="font-medium text-sm">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                  {attachment.size}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Mail className="size-16 text-neutral-400 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  No message selected
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  Select a message from your inbox to view its contents
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
