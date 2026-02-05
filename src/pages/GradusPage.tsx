import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { TextareaAutosize } from '@/app/components/ui/textarea-autosize';
import { gradusAPI } from '@/api/gradus';
import { useGrades } from '@/contexts/GradesContext';
import { useGradelyAuth } from '@/contexts/GradelyAuthContext';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from '@/types/chat';
import { Send, Plus, Menu, X, Edit2, Trash2, Check, ChevronDown } from 'lucide-react';

export function GradusPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { courses, gpaResult, attendance } = useGrades();
  const { user } = useGradelyAuth();
  const { 
    chats, 
    currentChat, 
    currentChatId, 
    createNewChat, 
    selectChat, 
    deleteChat, 
    updateChatTitle, 
    addMessage, 
    updateMessage, 
    deleteMessage 
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, streamingMessage]);

  useEffect(() => {
    // Create a new chat if none exists
    if (chats.length === 0) {
      createNewChat();
    }
  }, [chats.length, createNewChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChatId || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'delivered'
    };

    addMessage(currentChatId, userMessage);
    setMessage('');
    setIsLoading(true);

    try {
      // Prepare user data
      const userData = {
        courses: courses || [],
        attendance: attendance || [],
        gpaResult: gpaResult || { weightedGPA: 0, unweightedGPA: 0, totalCredits: 0 }
      };

      // Start streaming response
      setIsStreaming(true);
      setStreamingMessage('');

      await gradusAPI.streamMessage(
        userMessage.content,
        (chunk: string) => {
          setStreamingMessage(prev => prev + chunk);
        },
        userData
      );

      // Create assistant message with streamed content
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: streamingMessage,
        sender: 'gradus',
        timestamp: new Date(),
        status: 'delivered'
      };

      addMessage(currentChatId, assistantMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'gradus',
        timestamp: new Date(),
        status: 'error'
      };

      addMessage(currentChatId, errorMessage);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setMessage('');
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const handleEditTitle = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(chatId);
    setTempTitle(currentTitle);
  };

  const handleSaveTitle = (chatId: string) => {
    if (tempTitle.trim()) {
      updateChatTitle(chatId, tempTitle.trim());
    }
    setEditingTitle(null);
    setTempTitle('');
  };

  const handleCancelEdit = () => {
    setEditingTitle(null);
    setTempTitle('');
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-border bg-card`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Chat History</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat: any) => (
              <div
                key={chat.id}
                className={`p-3 cursor-pointer hover:bg-accent border-b border-border ${
                  currentChatId === chat.id ? 'bg-accent' : ''
                }`}
                onClick={() => selectChat(chat.id)}
              >
                <div className="flex items-center justify-between">
                  {editingTitle === chat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle(chat.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleSaveTitle(chat.id);
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate">
                          {chat.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {chat.messages.length} messages
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleEditTitle(chat.id, chat.title, e)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-xl font-semibold text-foreground">
              {currentChat?.title || 'Gradus AI Assistant'}
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.email && `Logged in as ${user.email}`}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <h3 className="text-lg font-medium mb-2">Welcome to Gradus AI!</h3>
              <p className="mb-4">I'm here to help you with your grades, attendance, and academic questions.</p>
              <div className="text-sm space-y-1">
                <p>• Ask about your current grades and GPA</p>
                <p>• Get study tips based on your performance</p>
                <p>• Analyze your attendance patterns</p>
                <p>• Get help with Gradely features</p>
              </div>
            </div>
          )}

          {currentChat?.messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {isStreaming && streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted text-foreground">
                <div className="whitespace-pre-wrap">{streamingMessage}</div>
                <div className="text-xs opacity-70 mt-1">Typing...</div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted text-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex gap-2">
            <TextareaAutosize
              ref={textareaRef}
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your grades, attendance, or academic questions..."
              className="flex-1 min-h-[60px] max-h-[200px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
