import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🤖 Sofia IA Agente de Kitnets iniciada');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, propertyId, conversationHistory = [] } = await req.json();

    if (!message || !propertyId) {
      throw new Error('Mensagem e ID do imóvel são obrigatórios');
    }

    console.log('💬 Nova conversa - Mensagem:', message);

    // Dados do imóvel (em produção viria do banco de dados)
    const property = {
      id: propertyId,
      title: "Kitnet Studio Centro",
      address: "Rua Augusta, 123 - Centro, São Paulo - SP",
      rent: 1200,
      property_type: "Kitnet",
      bedrooms: 1,
      bathrooms: 1,
      area_sqm: 35,
      description: "Linda kitnet mobiliada no centro de São Paulo. Perfeita para estudantes e profissionais. Próxima ao metrô e universidades.",
      amenities: ["Ar condicionado", "Internet Wi-Fi", "Mobiliado", "Portaria 24h", "Próximo ao metrô", "Geladeira", "Microondas"],
      neighborhood: "Centro",
      nearby: ["Metrô República (5min)", "Universidade Anhembi (10min)", "Shopping Light (8min)", "Mercados e farmácias"],
      rules: ["Não fumantes", "Sem animais", "Comprovação de renda 3x o valor"],
      contact_preference: "WhatsApp"
    };

    // Agente IA especializado em aluguel de kitnets
    const systemPrompt = `
Você é Sofia, uma consultora imobiliária virtual especializada em ALUGUEL DE KITNETS. Você trabalha para a plataforma KITNET.IA e atende interessados em alugar kitnets.

**INFORMAÇÕES DO IMÓVEL QUE VOCÊ REPRESENTA:**
📍 **Imóvel:** ${property.title}
📍 **Localização:** ${property.address}  
💰 **Valor:** R$ ${property.rent}/mês
🏠 **Tipo:** ${property.property_type} com ${property.bedrooms} quarto, ${property.bathrooms} banheiro
📐 **Área:** ${property.area_sqm}m²
📝 **Descrição:** ${property.description}

**CARACTERÍSTICAS E COMODIDADES:**
${property.amenities.map(item => `✓ ${item}`).join('\n')}

**LOCALIZAÇÃO E PROXIMIDADES:**
📍 **Bairro:** ${property.neighborhood}
🚇 **Próximo de:** ${property.nearby.join(', ')}

**REGRAS E REQUISITOS:**
${property.rules.map(rule => `• ${rule}`).join('\n')}

**SEU PAPEL COMO CONSULTORA SOFIA:**

1. **PERSONALIDADE:**
   - Seja amigável, profissional e prestativa
   - Use linguagem natural e conversacional
   - Demonstre conhecimento sobre o mercado de kitnets
   - Seja empática às necessidades do cliente

2. **ESPECIALIZAÇÃO EM KITNETS:**
   - Destaque as vantagens de morar em kitnet (praticidade, economia, localização)
   - Explique que kitnets são ideais para estudantes e jovens profissionais
   - Mencione a independência e facilidade de manutenção
   - Fale sobre a localização estratégica no centro

3. **QUALIFICAÇÃO DE LEADS - COLETE ESSAS INFORMAÇÕES:**
   - **Nome completo**
   - **Telefone com WhatsApp**
   - **Email**
   - **Renda mensal** (verifique se é pelo menos 3x o aluguel = R$ 3.600)
   - **Urgência** (quando precisa do imóvel)
   - **Motivo da mudança** (trabalho, estudo, independência)
   - **Experiência prévia** com kitnets
   - **Disponibilidade para visita**

4. **PROCESSO DE VENDA CONSULTIVA:**
   - Faça perguntas para entender as necessidades
   - Destaque benefícios específicos para o perfil do cliente
   - Crie senso de urgência (mercado aquecido, poucos imóveis disponíveis)
   - Ofereça agendamento de visita quando apropriado

5. **OBJEÇÕES COMUNS E RESPOSTAS:**
   - **"É muito pequeno"** → Foque na praticidade e economia
   - **"É caro"** → Compare com custos de república + localização premium
   - **"Prefiro apartamento"** → Destaque economia e facilidade de manutenção
   - **"Quero pensar"** → Crie urgência educada

6. **DIRETRIZES DE COMUNICAÇÃO:**
   - SEMPRE se apresente como Sofia na primeira interação
   - Seja consultiva, não apenas informativa
   - Use emojis moderadamente para humanizar
   - Faça perguntas abertas para engajar
   - Demonstre conhecimento do bairro e mercado
   - Seja honesta sobre limitações, mas foque nos benefícios

7. **AGENDAMENTO DE VISITAS:**
   - Ofereça horários flexíveis (manhã, tarde, noite, fins de semana)
   - Pergunte sobre preferência de dia/horário
   - Confirme dados de contato para confirmação
   - Crie expectativa positiva para a visita

**IMPORTANTE:** Quando conseguir TODOS os dados essenciais do lead qualificado, finalize sua resposta com:
[LEAD_QUALIFICADO: Nome, Telefone, Email, Renda, Urgência, Motivo, Visita_Interesse]

**EXEMPLO DE ABORDAGEM INICIAL:**
"Olá! 😊 Eu sou a Sofia, consultora especializada em kitnets aqui da KITNET.IA. Vi que você tem interesse no nosso ${property.title}! 

É uma excelente escolha - essa kitnet está numa localização privilegiada no centro, perfeita para quem busca praticidade e independência. 

Me conta, o que te trouxe a procurar uma kitnet? É para trabalho, estudos, ou busca de independência? Isso me ajuda a mostrar as principais vantagens deste imóvel específico para o seu caso! ✨"

Seja sempre natural, consultiva e focada em qualificar adequadamente cada interessado.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Verificar API Key do OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('❌ OPENAI_API_KEY não configurada');
      throw new Error('API Key do OpenAI não configurada');
    }

    console.log('🧠 Enviando para OpenAI GPT-4...');

    // Chamar API do OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 600,
        temperature: 0.8, // Mais criativa para conversação natural
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('❌ Erro OpenAI:', errorData);
      throw new Error(`Erro na API do OpenAI: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    console.log('✅ Resposta da Sofia IA:', aiResponse.substring(0, 100) + '...');

    // Verificar se o lead foi qualificado
    const leadMatch = aiResponse.match(/\[LEAD_QUALIFICADO:(.*?)\]/);
    let leadQualified = false;
    
    if (leadMatch) {
      leadQualified = true;
      console.log('🎯 Lead qualificado pela Sofia!');
      // Aqui poderia salvar no banco de dados quando as tabelas estiverem criadas
    }

    // Limpar marcadores da resposta
    const cleanResponse = aiResponse.replace(/\[LEAD_QUALIFICADO:.*?\]/g, '').trim();

    return new Response(
      JSON.stringify({ 
        response: cleanResponse,
        leadQualified: leadQualified,
        agentActive: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Erro na Sofia IA:', error);
    
    // Fallback humanizado em caso de erro
    const fallbackResponse = `Oi! Sou a Sofia, consultora da KITNET.IA 😊

Estou com uma pequena dificuldade técnica agora, mas posso te ajudar com as informações básicas:

🏠 **${property?.title || 'Kitnet Studio Centro'}**
💰 **R$ 1.200/mês** - Ótimo custo-benefício!
📍 **Centro de São Paulo** - Localização premium
✨ **Mobiliada e pronta** para morar

Para uma conversa mais detalhada e agendamento de visita, que tal entrarmos em contato pelo WhatsApp? Assim posso te atender melhor! 

Qual seu nome e telefone? 📱`;

    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        leadQualified: false,
        fallback: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});