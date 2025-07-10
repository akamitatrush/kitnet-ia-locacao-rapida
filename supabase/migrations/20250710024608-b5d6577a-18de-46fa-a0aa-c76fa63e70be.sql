-- Criar bucket para imagens dos imóveis
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true);

-- Políticas para o bucket property-images
-- Permitir que usuários autenticados façam upload de suas próprias imagens
CREATE POLICY "Usuários podem fazer upload de suas próprias imagens" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que todos vejam as imagens (bucket público)
CREATE POLICY "Imagens são publicamente visíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-images');

-- Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Usuários podem atualizar suas próprias imagens" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Usuários podem deletar suas próprias imagens" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);