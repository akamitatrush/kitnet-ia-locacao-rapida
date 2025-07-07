import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalProperties: number;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageTime: number;
  monthlyRevenue: number;
  loading: boolean;
}

export const useDashboardMetrics = (dateFilter: string = 'all') => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProperties: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    averageTime: 0,
    monthlyRevenue: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Calculate date filter
        let dateCondition = '';
        const now = new Date();
        if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateCondition = `and created_at >= '${sevenDaysAgo.toISOString()}'`;
        } else if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateCondition = `and created_at >= '${thirtyDaysAgo.toISOString()}'`;
        }

        // Get user properties
        const { data: properties } = await supabase
          .from('properties')
          .select('id, rent, is_active')
          .eq('user_id', user.id);

        const totalProperties = properties?.length || 0;
        const activeProperties = properties?.filter(p => p.is_active) || [];
        const monthlyRevenue = activeProperties.reduce((sum, p) => sum + (p.rent || 0), 0);

        // Get leads from conversations
        const propertyIds = properties?.map(p => p.id) || [];
        
        if (propertyIds.length > 0) {
          const { data: conversations } = await supabase
            .from('chatbot_conversations')
            .select('id, lead_qualified, created_at, property_id')
            .in('property_id', propertyIds);

          const totalLeads = conversations?.length || 0;
          const qualifiedLeads = conversations?.filter(c => c.lead_qualified)?.length || 0;
          const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

          // Calculate average time (simplified - time between first conversation and qualification)
          const qualifiedConversations = conversations?.filter(c => c.lead_qualified) || [];
          const averageTime = qualifiedConversations.length > 0 ? 
            Math.round(qualifiedConversations.reduce((sum, c) => {
              const days = Math.floor((new Date().getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
              return sum + days;
            }, 0) / qualifiedConversations.length) : 0;

          setMetrics({
            totalProperties,
            totalLeads,
            qualifiedLeads,
            conversionRate,
            averageTime,
            monthlyRevenue,
            loading: false,
          });
        } else {
          setMetrics({
            totalProperties,
            totalLeads: 0,
            qualifiedLeads: 0,
            conversionRate: 0,
            averageTime: 0,
            monthlyRevenue,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMetrics();
  }, [dateFilter]);

  return metrics;
};