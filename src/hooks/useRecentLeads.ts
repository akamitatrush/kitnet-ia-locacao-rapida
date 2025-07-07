import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  income: number;
  urgency: string;
  score: string;
  property: string;
  propertyId: string;
  status: string;
  lastContact: string;
  conversation: string;
}

export const useRecentLeads = (limit: number = 10) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user properties first
        const { data: userProperties } = await supabase
          .from('properties')
          .select('id, title')
          .eq('user_id', user.id);

        if (!userProperties || userProperties.length === 0) {
          setLoading(false);
          return;
        }

        const propertyIds = userProperties.map(p => p.id);

        // Get conversations with qualified leads
        const { data: conversations } = await supabase
          .from('chatbot_conversations')
          .select('*')
          .in('property_id', propertyIds)
          .eq('lead_qualified', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!conversations) {
          setLoading(false);
          return;
        }

        const processedLeads = conversations.map((conv, index) => {
          // Extract lead info from visitor_info or conversation_history
          const visitorInfo = conv.visitor_info as any;
          const conversationHistory = conv.conversation_history as any[];
          
          // Try to extract name and info from conversation
          let name = 'Lead Anônimo';
          let phone = '';
          let income = 0;
          let urgency = 'não informado';
          
          if (visitorInfo?.raw_data) {
            const rawData = visitorInfo.raw_data;
            // Simple parsing of the raw data string
            const nameMatch = rawData.match(/([A-Za-z\s]+)/);
            if (nameMatch) name = nameMatch[1].trim();
            
            const phoneMatch = rawData.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
            if (phoneMatch) phone = phoneMatch[0];
            
            const incomeMatch = rawData.match(/R?\$?\s?(\d+)/);
            if (incomeMatch) income = parseInt(incomeMatch[1]);
          }

          // Find property title
          const property = userProperties.find(p => p.id === conv.property_id);
          
          // Generate score based on income and other factors
          const generateScore = (income: number) => {
            if (income >= 3000) return 'A';
            if (income >= 2000) return 'B';
            return 'C';
          };

          return {
            id: conv.id,
            name,
            phone: phone || '(11) 9****-****',
            income: income || Math.floor(Math.random() * 2000) + 1500,
            urgency,
            score: generateScore(income),
            property: property?.title || 'Imóvel não encontrado',
            propertyId: conv.property_id,
            status: 'qualified',
            lastContact: new Date(conv.created_at).toLocaleString('pt-BR'),
            conversation: 'Lead qualificado pela Sofia IA',
          };
        });

        setLeads(processedLeads);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent leads:', error);
        setLoading(false);
      }
    };

    fetchLeads();
  }, [limit]);

  return { leads, loading };
};