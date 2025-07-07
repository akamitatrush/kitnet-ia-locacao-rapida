import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyAnalytics {
  id: string;
  title: string;
  address: string;
  rent: number;
  status: string;
  leads: number;
  views: number;
  photos: number;
  conversionRate: number;
  qualifiedLeads: number;
  link: string;
  createdAt: string;
}

export const usePropertyAnalytics = () => {
  const [properties, setProperties] = useState<PropertyAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user properties
        const { data: userProperties } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!userProperties) {
          setLoading(false);
          return;
        }

        // Get conversations for each property
        const propertyAnalytics = await Promise.all(
          userProperties.map(async (property) => {
            const { data: conversations } = await supabase
              .from('chatbot_conversations')
              .select('id, lead_qualified')
              .eq('property_id', property.id);

            const totalLeads = conversations?.length || 0;
            const qualifiedLeads = conversations?.filter(c => c.lead_qualified)?.length || 0;
            const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

            return {
              id: property.id,
              title: property.title,
              address: property.address,
              rent: property.rent,
              status: property.is_active ? 'available' : 'inactive',
              leads: totalLeads,
              views: Math.floor(Math.random() * 100) + 20, // Simulated for now
              photos: property.images?.length || 0,
              conversionRate,
              qualifiedLeads,
              link: `${window.location.origin}/property/${property.id}`,
              createdAt: property.created_at,
            };
          })
        );

        setProperties(propertyAnalytics);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property analytics:', error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return { properties, loading };
};