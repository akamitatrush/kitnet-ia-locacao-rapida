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
      .single();

    if (propertyError || !property) {
      console.error('❌ Erro buscando imóvel:', propertyError);
      throw new Error('Imóvel não encontrado ou inativo');
    }

    console.log('🏠 Imóvel encontrado:', property.title);

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

    console.log('🧠 Enviando para Maria (Assistant API)...');

    // ID do Assistant da Maria
    const assistantId = 'asst_WySSIEkxyfXjAur6qFUYm2cN';

    // Criar uma nova thread para a conversa
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({}),
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.text();
      console.error('❌ Erro criando thread:', errorData);
      throw new Error(`Erro criando thread: ${threadResponse.status}`);
    }

    const threadData = await threadResponse.json();
    const threadId = threadData.id;

    // Adicionar a mensagem do usuário à thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        role: 'user',
        content: message,
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.text();
      console.error('❌ Erro adicionando mensagem:', errorData);
      throw new Error(`Erro adicionando mensagem: ${messageResponse.status}`);
    }

    // Executar o assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.text();
      console.error('❌ Erro executando assistant:', errorData);
      throw new Error(`Erro executando assistant: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Aguardar a conclusão do run
    let runStatus = 'in_progress';
    let attempts = 0;
    const maxAttempts = 30; // 30 segundos timeout

    while (runStatus === 'in_progress' || runStatus === 'queued') {
      if (attempts >= maxAttempts) {
        throw new Error('Timeout aguardando resposta do assistant');
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
      attempts++;

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Erro verificando status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;

      console.log(`📊 Status do run: ${runStatus} (tentativa ${attempts})`);
    }

    if (runStatus !== 'completed') {
      throw new Error(`Run falhou com status: ${runStatus}`);
    }

    // Buscar as mensagens da thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    });

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text();
      console.error('❌ Erro buscando mensagens:', errorData);
      throw new Error(`Erro buscando mensagens: ${messagesResponse.status}`);
    }

    const messagesData = await messagesResponse.json();
    const aiResponse = messagesData.data[0].content[0].text.value;

    console.log('✅ Resposta da Sofia IA:', aiResponse.substring(0, 100) + '...');

    // Verificar se o lead foi qualificado
    const leadMatch = aiResponse.match(/\[LEAD_QUALIFICADO:(.*?)\]/);
    let leadQualified = false;
    
    if (leadMatch) {
      leadQualified = true;
      console.log('🎯 Lead qualificado pela Sofia!');
      
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