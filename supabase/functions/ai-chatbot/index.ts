import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, propertyId, conversationHistory = [] } = await req.json();

    if (!message || !propertyId) {
      throw new Error('Mensagem e ID do imóvel são obrigatórios');
    }

    console.log('Recebida mensagem:', message, 'para propriedade:', propertyId);

    // Get property details - usando dados mock para teste
    const mockProperty = {
      id: propertyId,
      title: "Kitnet Studio Centro",
      address: "Centro, São Paulo - SP",
      rent: 1200,
      property_type: "Kitnet",
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 35,
      description: "Linda kitnet mobiliada no centro de São Paulo. Perfeita para estudantes e profissionais. Próxima ao metrô e universidades.",
      amenities: ["Ar condicionado", "Internet Wi-Fi", "Mobiliado", "Portaria 24h"],
      user_id: "mock-user-id"
    };

    // Usar dados mock do proprietário para teste
    const mockOwner = {
      id: "mock-user-id",
      display_name: "Proprietário Teste"
    };

    // Create AI assistant prompt with property information
    const systemPrompt = `
Você é Sofia, uma assistente virtual especializada em imóveis. Você está atendendo interessados no seguinte imóvel:

**INFORMAÇÕES DO IMÓVEL:**
- Título: ${mockProperty.title}
- Endereço: ${mockProperty.address}
- Preço: R$ ${mockProperty.rent}/mês
- Tipo: ${mockProperty.property_type}
- Quartos: ${mockProperty.bedrooms}
- Banheiros: ${mockProperty.bathrooms}
- Área: ${mockProperty.area_sqm}m²
- Descrição: ${mockProperty.description}
- Características: ${mockProperty.amenities?.join(', ') || 'Não especificadas'}

**SEU PAPEL:**
1. Seja amigável, profissional e prestativa
2. Responda perguntas sobre o imóvel de forma detalhada
3. Colete informações do interessado: nome, telefone, email, renda mensal, urgência
4. Qualifique o lead verificando se a renda é compatível (mínimo 3x o valor do aluguel)
5. Ofereça agendamento de visita para leads qualificados
6. Seja natural e humanizada na conversa

**DIRETRIZES:**
- Sempre se apresente como Sofia na primeira mensagem
- Seja educada e use linguagem profissional mas amigável
- Se perguntarem sobre outros imóveis, diga que você atende especificamente este
- Para agendamento, pergunte preferência de horário (manhã, tarde, fim de semana)
- Se o interessado não tem renda suficiente, seja diplomática e sugira que ele procure imóveis na sua faixa de preço

**FORMATO DE RESPOSTA:**
Responda de forma natural e conversacional. Se conseguir todas as informações necessárias do lead, termine sua resposta com:
[LEAD_QUALIFICADO: Nome, Telefone, Email, Renda, Urgência, Interesse_Visita]
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('Erro na API do OpenAI');
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    // Check if lead is qualified (contains lead qualification data)
    const leadMatch = aiResponse.match(/\[LEAD_QUALIFICADO:(.*?)\]/);
    
    if (leadMatch) {
      const leadData = leadMatch[1].split(',').map(item => item.trim());
      
      if (leadData.length >= 5) {
        // Save lead to database
        const { error: leadError } = await supabase
          .from('leads')
          .insert({
            property_id: propertyId,
            name: leadData[0],
            phone: leadData[1],
            email: leadData[2],
            income: parseFloat(leadData[3].replace(/[^\d]/g, '')) || 0,
            urgency: leadData[4],
            message: `Lead qualificado via IA - Interesse em visita: ${leadData[5] || 'Não especificado'}`,
            source: 'ai_chatbot'
          });

        if (!leadError) {
          console.log('Lead salvo com sucesso:', leadData);
        }
      }
    }

    // Remove the lead qualification tag from response
    const cleanResponse = aiResponse.replace(/\[LEAD_QUALIFICADO:.*?\]/g, '').trim();

    return new Response(
      JSON.stringify({ 
        response: cleanResponse,
        leadQualified: !!leadMatch
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro no chatbot:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns minutos.',
        response: 'Ops! Parece que estou com um problema técnico. Que tal tentar entrar em contato diretamente com o proprietário? 😊'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});