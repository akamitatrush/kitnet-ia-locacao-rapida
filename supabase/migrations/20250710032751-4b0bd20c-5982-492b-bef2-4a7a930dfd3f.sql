-- Sistema de Mensagens Internas
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sistema de Agendamento de Visitas
CREATE TABLE public.visit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  preferred_date TIMESTAMP WITH TIME ZONE NOT NULL,
  alternative_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed')),
  visitor_message TEXT,
  owner_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sistema de Avaliações
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT,
  stay_duration INTEGER, -- em meses
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Métricas de Visualização
CREATE TABLE public.property_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  visitor_id UUID,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comparador de Imóveis
CREATE TABLE public.property_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_ids UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurações de Usuário
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies para Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias conversas"
ON public.conversations FOR SELECT
USING (auth.uid() = visitor_id OR auth.uid() = owner_id);

CREATE POLICY "Usuários podem criar conversas"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = visitor_id OR auth.uid() = owner_id);

-- RLS Policies para Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens de suas conversas"
ON public.messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = visitor_id OR auth.uid() = owner_id
  )
);

CREATE POLICY "Usuários podem enviar mensagens em suas conversas"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE auth.uid() = visitor_id OR auth.uid() = owner_id
  )
);

-- RLS Policies para Visit Requests
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas solicitações de visita"
ON public.visit_requests FOR SELECT
USING (auth.uid() = visitor_id OR auth.uid() = owner_id);

CREATE POLICY "Usuários podem criar solicitações de visita"
ON public.visit_requests FOR INSERT
WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Proprietários podem atualizar solicitações de visita"
ON public.visit_requests FOR UPDATE
USING (auth.uid() = owner_id);

-- RLS Policies para Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews são visíveis publicamente"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Usuários podem criar suas próprias reviews"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Usuários podem atualizar suas próprias reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = reviewer_id);

-- RLS Policies para Property Views
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Proprietários podem ver visualizações de seus imóveis"
ON public.property_views FOR SELECT
USING (
  property_id IN (
    SELECT id FROM public.properties 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Qualquer um pode registrar visualizações"
ON public.property_views FOR INSERT
WITH CHECK (true);

-- RLS Policies para Property Comparisons
ALTER TABLE public.property_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias comparações"
ON public.property_comparisons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias comparações"
ON public.property_comparisons FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies para User Preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias preferências"
ON public.user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias preferências"
ON public.user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias preferências"
ON public.user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visit_requests_updated_at
BEFORE UPDATE ON public.visit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();