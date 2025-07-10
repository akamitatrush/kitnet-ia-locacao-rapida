import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  property_id: string;
  visitor_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    images: string[];
  };
  visitor_profile?: {
    full_name: string;
    avatar_url: string;
  };
  owner_profile?: {
    full_name: string;
    avatar_url: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url: string;
  };
}

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          properties!inner(title, images),
          profiles!conversations_visitor_id_fkey(full_name, avatar_url),
          profiles!conversations_owner_id_fkey(full_name, avatar_url)
        `)
        .or(`visitor_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (data || []).map(async (conv) => {
          const [lastMessageResult, unreadResult] = await Promise.all([
            supabase
              .from('messages')
              .select('content, created_at, sender_id')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from('messages')
              .select('id')
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .is('read_at', null)
          ]);

          return {
            ...conv,
            last_message: lastMessageResult.data,
            unread_count: unreadResult.data?.length || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar conversas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (propertyId: string, ownerId: string) => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('property_id', propertyId)
        .eq('visitor_id', user.id)
        .eq('owner_id', ownerId)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          property_id: propertyId,
          visitor_id: user.id,
          owner_id: ownerId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data.id;
    } catch (error: any) {
      toast({
        title: "Erro ao criar conversa",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  };
};

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      markAsRead();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey(full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar mensagens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      await fetchMessages();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .is('read_at', null);
  };

  return {
    messages,
    loading,
    sendMessage,
    fetchMessages,
  };
};