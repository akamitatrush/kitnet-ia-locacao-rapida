-- Criar tabela de imóveis
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  neighborhood TEXT,
  rent DECIMAL(10,2) NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'Kitnet',
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  area_sqm INTEGER,
  amenities TEXT[],
  nearby TEXT[],
  rules TEXT[],
  contact_preference TEXT DEFAULT 'WhatsApp',
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios imóveis" 
ON public.properties 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios imóveis" 
ON public.properties 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios imóveis" 
ON public.properties 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios imóveis" 
ON public.properties 
FOR DELETE 
USING (auth.uid() = user_id);

-- Política para visualização pública dos imóveis ativos
CREATE POLICY "Imóveis ativos são visíveis publicamente" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de conversas do chatbot
CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id),
  visitor_info JSONB,
  conversation_history JSONB[],
  lead_qualified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para conversas
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proprietários podem ver conversas de seus imóveis" 
ON public.chatbot_conversations 
FOR SELECT 
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Qualquer um pode criar conversas" 
ON public.chatbot_conversations 
FOR INSERT 
WITH CHECK (true);

-- Trigger para conversas
CREATE TRIGGER update_chatbot_conversations_updated_at
BEFORE UPDATE ON public.chatbot_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();