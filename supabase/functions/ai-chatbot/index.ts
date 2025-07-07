import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Edge Function ai-chatbot executada');
  console.log('📝 Método:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Retornando CORS headers');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📨 Processando requisição...');
    
    // Ler o body da requisição
    const requestBody = await req.json();
    console.log('📦 Body recebido:', JSON.stringify(requestBody));
    
    const { message, propertyId } = requestBody;
    console.log('💬 Mensagem:', message);
    console.log('🏠 Property ID:', propertyId);

    // Resposta simples de teste
    const response = {
      response: `Olá! 😊 Eu sou a Sofia, assistente virtual do imóvel "Kitnet Studio Centro".

Recebi sua mensagem: "${message}"

📍 **Endereço:** Rua Augusta, 123 - Centro, São Paulo - SP
💰 **Preço:** R$ 1.200/mês
🏠 **Tipo:** Kitnet com 1 quarto e 1 banheiro
📐 **Área:** 35m²

**Características:**
✓ Ar condicionado
✓ Internet Wi-Fi  
✓ Mobiliado
✓ Portaria 24h
✓ Próximo ao metrô

Como posso ajudar você com mais informações sobre este imóvel? 🤖`,
      leadQualified: false,
      test: true
    };

    console.log('✅ Enviando resposta de teste');
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 ERRO na Edge Function:', error);
    console.error('📋 Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: `Erro interno: ${error.message}`,
        response: 'Desculpe, estou com dificuldades técnicas no momento. Que tal tentar entrar em contato diretamente pelo WhatsApp? 😊',
        debug: error.stack
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});