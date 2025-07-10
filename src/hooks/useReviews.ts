import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  property_id: string;
  reviewer_id: string;
  rating: number;
  title: string;
  comment: string | null;
  stay_duration: number | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  reviewer_profile?: {
    full_name: string;
    avatar_url: string;
  };
}

export const useReviews = (propertyId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (propertyId) {
      fetchReviews();
    }
  }, [propertyId]);

  const fetchReviews = async () => {
    if (!propertyId) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      setTotalReviews(data?.length || 0);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar avaliações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: {
    property_id: string;
    rating: number;
    title: string;
    comment?: string;
    stay_duration?: number;
  }) => {
    if (!user) return false;

    try {
      // Check if user already reviewed this property
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('property_id', reviewData.property_id)
        .eq('reviewer_id', user.id)
        .single();

      if (existing) {
        toast({
          title: "Avaliação já existe",
          description: "Você já avaliou este imóvel.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          reviewer_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Avaliação criada!",
        description: "Sua avaliação foi publicada com sucesso.",
      });

      await fetchReviews();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao criar avaliação",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateReview = async (reviewId: string, updates: Partial<Review>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;

      toast({
        title: "Avaliação atualizada!",
        description: "Sua avaliação foi atualizada com sucesso.",
      });

      await fetchReviews();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar avaliação",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;

      toast({
        title: "Avaliação excluída!",
        description: "Sua avaliação foi removida com sucesso.",
      });

      await fetchReviews();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao excluir avaliação",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    reviews,
    loading,
    averageRating,
    totalReviews,
    createReview,
    updateReview,
    deleteReview,
    fetchReviews,
  };
};