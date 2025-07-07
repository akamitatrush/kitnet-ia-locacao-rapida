import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 Sofia Chatbot iniciada');
    
    const { message, propertyId, conversationHistory = [] } = await req.json();

    if (!message || !propertyId) {
      throw new Error('Mensagem e ID do imóvel são obrigatórios');
    }

    console.log('📩 Mensagem recebida:', message);
    console.log('🏠 Property ID:', propertyId);

    // Dados mock do imóvel (sempre funcionará)
    const mockProperty = {
      id: propertyId,
      title: "Kitnet Studio Centro",
      address: "Rua Augusta, 123 - Centro, São Paulo - SP",
      rent: 1200,
      property_type: "Kitnet",
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 35,
      description: "Linda kitnet mobiliada no centro de São Paulo. Perfeita para estudantes e profissionais. Próxima ao metrô e universidades.",
      amenities: ["Ar condicionado", "Internet Wi-Fi", "Mobiliado", "Portaria 24h", "Próximo ao metrô"]
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
- Sempre se apresente como Sofia na primeira mensagem se ainda não o fez
- Seja educada e use linguagem profissional mas amigável
- Se perguntarem sobre outros imóveis, diga que você atende especificamente este
- Para agendamento, pergunte preferência de horário (manhã, tarde, fim de semana)
- Se o interessado não tem renda suficiente, seja diplomática e sugira que ele procure imóveis na sua faixa de preço

**IMPORTANTE:** Seja conversacional e natural. Não seja repetitiva ou robótica.

**FORMATO DE RESPOSTA:**
Responda de forma natural e conversacional. Se conseguir todas as informações necessárias do lead (nome, telefone, email, renda, urgência), termine sua resposta com:
[LEAD_QUALIFICADO: Nome, Telefone, Email, Renda, Urgência, Interesse_Visita]
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log('🧠 Enviando para OpenAI...');

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
      const errorData = await openAIResponse.text();
      console.error('❌ Erro OpenAI:', errorData);
      throw new Error(`Erro na API do OpenAI: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    console.log('✅ Resposta da IA:', aiResponse);

    // Check if lead is qualified
    const leadMatch = aiResponse.match(/\[LEAD_QUALIFICADO:(.*?)\]/);
    let leadQualified = false;
    
    if (leadMatch) {
      leadQualified = true;
      console.log('🎯 Lead qualificado detectado!');
    }

    // Remove the lead qualification tag from response
    const cleanResponse = aiResponse.replace(/\[LEAD_QUALIFICADO:.*?\]/g, '').trim();

    console.log('📤 Enviando resposta limpa');

    return new Response(
      JSON.stringify({ 
        response: cleanResponse,
        leadQualified: leadQualified
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Erro no chatbot:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        response: 'Desculpe, estou com dificuldades técnicas no momento. Que tal tentar entrar em contato diretamente pelo WhatsApp? 😊'
      }),
      {
        status: 200, // Retornando status 200 para evitar erro no frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});