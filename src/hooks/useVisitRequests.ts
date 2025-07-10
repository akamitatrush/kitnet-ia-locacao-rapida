import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VisitRequest {
  id: string;
  property_id: string;
  visitor_id: string;
  owner_id: string;
  preferred_date: string;
  alternative_date: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  visitor_message: string | null;
  owner_response: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    address: string;
    images: string[];
  };
  visitor_profile?: {
    full_name: string;
    phone: string;
    avatar_url: string;
  };
  owner_profile?: {
    full_name: string;
    phone: string;
    avatar_url: string;
  };
}

export const useVisitRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchVisitRequests();
    }
  }, [user]);

  const fetchVisitRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('visit_requests')
        .select(`
          *,
          properties!inner(title, address, images),
          profiles!visit_requests_visitor_id_fkey(full_name, phone, avatar_url),
          profiles!visit_requests_owner_id_fkey(full_name, phone, avatar_url)
        `)
        .or(`visitor_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVisitRequests((data || []) as VisitRequest[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createVisitRequest = async (requestData: {
    property_id: string;
    owner_id: string;
    preferred_date: string;
    alternative_date?: string;
    visitor_message?: string;
  }) => {
    if (!user) return false;

    try {
      // Check if there's already a pending request
      const { data: existing } = await supabase
        .from('visit_requests')
        .select('id')
        .eq('property_id', requestData.property_id)
        .eq('visitor_id', user.id)
        .eq('status', 'pending')
        .single();

      if (existing) {
        toast({
          title: "Solicitação já existe",
          description: "Você já tem uma solicitação de visita pendente para este imóvel.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('visit_requests')
        .insert({
          ...requestData,
          visitor_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação de visita foi enviada ao proprietário.",
      });

      await fetchVisitRequests();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao solicitar visita",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateVisitRequest = async (
    requestId: string, 
    updates: {
      status?: 'confirmed' | 'rejected' | 'completed';
      owner_response?: string;
    }
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('visit_requests')
        .update(updates)
        .eq('id', requestId)
        .eq('owner_id', user.id);

      if (error) throw error;

      const statusMessages = {
        confirmed: "Visita confirmada!",
        rejected: "Visita rejeitada.",
        completed: "Visita marcada como realizada.",
      };

      toast({
        title: statusMessages[updates.status as keyof typeof statusMessages] || "Solicitação atualizada!",
        description: "A solicitação foi atualizada com sucesso.",
      });

      await fetchVisitRequests();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar solicitação",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelVisitRequest = async (requestId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('visit_requests')
        .delete()
        .eq('id', requestId)
        .eq('visitor_id', user.id);

      if (error) throw error;

      toast({
        title: "Solicitação cancelada!",
        description: "Sua solicitação de visita foi cancelada.",
      });

      await fetchVisitRequests();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar solicitação",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    visitRequests,
    loading,
    createVisitRequest,
    updateVisitRequest,
    cancelVisitRequest,
    fetchVisitRequests,
  };
};