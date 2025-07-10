import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Phone, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConversations, useMessages } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatSystemProps {
  propertyId?: string;
  ownerId?: string;
  propertyTitle?: string;
}

export const ChatSystem = ({ propertyId, ownerId, propertyTitle }: ChatSystemProps) => {
  const { user } = useAuth();
  const { conversations, createConversation } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  const { messages, sendMessage, loading: messagesLoading } = useMessages(selectedConversation || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartConversation = async () => {
    if (!user || !propertyId || !ownerId) return;
    
    const conversationId = await createConversation(propertyId, ownerId);
    if (conversationId) {
      setSelectedConversation(conversationId);
      setIsOpen(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setIsOpen(true);
  };

  // Chat trigger button for property pages
  if (propertyId && ownerId && !isOpen) {
    return (
      <Button
        onClick={handleStartConversation}
        className="w-full"
        disabled={!user || user.id === ownerId}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Enviar Mensagem
      </Button>
    );
  }

  // Conversations list and chat interface
  return (
    <>
      {/* Conversations List (for general chat page) */}
      {!propertyId && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Mensagens</h2>
          
          {conversations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma conversa ainda.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Entre em contato com proprietários através das páginas dos imóveis.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const isOwner = user?.id === conversation.owner_id;
                const otherUser = isOwner ? conversation.visitor_profile : conversation.owner_profile;
                
                return (
                  <Card 
                    key={conversation.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback>
                            {otherUser?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium truncate">
                                {conversation.property?.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {otherUser?.full_name}
                              </p>
                            </div>
                            
                            {conversation.unread_count! > 0 && (
                              <div className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {conversation.unread_count}
                              </div>
                            )}
                          </div>
                          
                          {conversation.last_message && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message.content}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chat Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {propertyTitle || 'Conversa'}
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="text-center text-muted-foreground">
                Carregando mensagens...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma mensagem ainda.</p>
                <p className="text-sm">Envie a primeira mensagem!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = user?.id === message.sender_id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] ${isOwn ? 'order-first' : ''}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                        {message.read_at && isOwn && (
                          <span className="ml-2">✓</span>
                        )}
                      </p>
                    </div>
                    
                    {isOwn && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.sender_profile?.avatar_url} />
                        <AvatarFallback>
                          {message.sender_profile?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};