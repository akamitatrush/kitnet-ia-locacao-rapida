import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados reais do imóvel no banco de dados
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('is_active', true)
      .maybeSingle();

    if (propertyError) {
      console.error('❌ Erro buscando imóvel:', propertyError);
      throw new Error(`Erro ao buscar imóvel: ${propertyError.message}`);
    }

    if (!property) {
      console.error('❌ Imóvel não encontrado:', propertyId);
      throw new Error('Imóvel não encontrado ou inativo');
    }

    console.log('🏠 Imóvel encontrado:', property.title);

    console.log('🧠 Enviando para ChatGPT com contexto completo...');

    // Agente IA especializado em aluguel de kitnets com contexto da conversa
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
${property.amenities?.map(item => `✓ ${item}`).join('\n') || 'Não especificado'}

**LOCALIZAÇÃO E PROXIMIDADES:**
📍 **Bairro:** ${property.neighborhood}
🚇 **Próximo de:** ${property.nearby?.join(', ') || 'Informações de proximidade não disponíveis'}

**REGRAS E REQUISITOS:**
${property.rules?.map(rule => `• ${rule}`).join('\n') || 'Sem regras específicas listadas'}

**INSTRUÇÕES IMPORTANTES:**
1. **SEMPRE MANTENHA O CONTEXTO:** Lembre-se de TODAS as informações que o cliente já forneceu anteriormente. NUNCA peça a mesma informação duas vezes.

2. **QUALIFICAÇÃO DE LEADS - COLETE ESSAS INFORMAÇÕES (uma de cada vez):**
   - Nome completo
   - Telefone com WhatsApp
   - Email
   - Renda mensal (verifique se é pelo menos 3x o aluguel = R$ ${property.rent * 3})
   - Urgência (quando precisa do imóvel)
   - Motivo da mudança (trabalho, estudo, independência)
   - Disponibilidade para visita

3. **PROCESSO DE QUALIFICAÇÃO:**
   - Colete UMA informação por vez
   - Demonstre que você LEMBRA das informações já fornecidas
   - Seja natural e conversacional
   - Crie conexão pessoal com o cliente

4. **QUANDO CONSEGUIR TODAS AS INFORMAÇÕES:**
   Finalize com: [LEAD_QUALIFICADO: Nome, Telefone, Email, Renda, Urgência, Motivo, Visita_Interesse]

**EXEMPLO DE COMO MANTER CONTEXTO:**
Se o cliente já disse o nome "João" e a renda "R$ 5000", você deve dizer:
"Perfeito João! Vi que sua renda de R$ 5000 está ótima para este imóvel. Agora me conta..."

NUNCA pergunte novamente informações já fornecidas!

Seja sempre natural, consultiva e focada em qualificar adequadamente cada interessado mantendo TODO o contexto da conversa.
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

    // Usar Chat Completions API com gpt-4o-mini para melhor controle do contexto
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API OpenAI:', errorData);
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ Resposta da Sofia IA:', aiResponse.substring(0, 100) + '...');

    // Verificar se o lead foi qualificado
    const leadMatch = aiResponse.match(/\[LEAD_QUALIFICADO:(.*?)\]/);
    let leadQualified = false;
    
    if (leadMatch) {
      leadQualified = true;
      console.log('🎯 Lead qualificado pela Sofia!');
    }

    // Limpar marcadores da resposta
    const cleanResponse = aiResponse.replace(/\[LEAD_QUALIFICADO:.*?\]/g, '').trim();
    
    if (leadMatch) {
      // Salvar conversa qualificada no banco
      const { error: saveError } = await supabase
        .from('chatbot_conversations')
        .insert({
          property_id: propertyId,
          visitor_info: leadMatch[1] ? { raw_data: leadMatch[1] } : null,
          conversation_history: [...conversationHistory, { role: 'user', content: message }, { role: 'assistant', content: cleanResponse }],
          lead_qualified: true
        });
      
      if (saveError) {
        console.error('❌ Erro salvando conversa:', saveError);
      } else {
        console.log('✅ Conversa salva com sucesso!');
      }
    }

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