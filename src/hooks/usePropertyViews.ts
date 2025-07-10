import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePropertyViews = () => {
  const { user } = useAuth();

  const trackView = async (propertyId: string) => {
    try {
      await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          visitor_id: user?.id || null,
          ip_address: null, // Could be populated with actual IP if needed
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });
    } catch (error) {
      // Silently fail - tracking shouldn't break the user experience
      console.warn('Failed to track property view:', error);
    }
  };

  const getPropertyMetrics = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('property_views')
        .select('*')
        .eq('property_id', propertyId);

      if (error) throw error;

      const totalViews = data?.length || 0;
      const uniqueViews = new Set(data?.map(v => v.visitor_id || v.ip_address)).size;
      const viewsToday = data?.filter(v => {
        const viewDate = new Date(v.viewed_at);
        const today = new Date();
        return viewDate.toDateString() === today.toDateString();
      }).length || 0;

      return {
        totalViews,
        uniqueViews,
        viewsToday,
        recentViews: data?.slice(-10) || [],
      };
    } catch (error) {
      console.error('Failed to get property metrics:', error);
      return {
        totalViews: 0,
        uniqueViews: 0,
        viewsToday: 0,
        recentViews: [],
      };
    }
  };

  return {
    trackView,
    getPropertyMetrics,
  };
};