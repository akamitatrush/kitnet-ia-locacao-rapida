-- Inserir um imóvel de exemplo para teste
INSERT INTO public.properties (
  id,
  user_id,
  title,
  description,
  address,
  neighborhood,
  rent,
  property_type,
  bedrooms,
  bathrooms,
  area_sqm,
  amenities,
  nearby,
  rules,
  contact_preference,
  images,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Kitnet Studio Centro',
  'Linda kitnet mobiliada no centro de São Paulo. Perfeita para estudantes e profissionais. Próxima ao metrô e universidades.',
  'Rua Augusta, 123 - Centro, São Paulo - SP',
  'Centro',
  1200.00,
  'Kitnet',
  1,
  1,
  35,
  ARRAY['Ar condicionado', 'Internet Wi-Fi', 'Mobiliado', 'Portaria 24h', 'Próximo ao metrô', 'Geladeira', 'Microondas'],
  ARRAY['Metrô República (5min)', 'Universidade Anhembi (10min)', 'Shopping Light (8min)', 'Mercados e farmácias'],
  ARRAY['Não fumantes', 'Sem animais', 'Comprovação de renda 3x o valor'],
  'WhatsApp',
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
  ],
  true
);