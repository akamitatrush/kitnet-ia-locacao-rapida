import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AIChatbot from "@/components/AIChatbot";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  Home, 
  MessageCircle,
  Phone,
  AlertCircle
} from "lucide-react";

const PropertyPublic = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder images para quando não há imagens
  const placeholderImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
  ];

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError("ID do imóvel não encontrado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Erro ao buscar imóvel:', error);
          setError("Imóvel não encontrado ou não está ativo");
          return;
        }

        if (!data) {
          setError("Imóvel não encontrado");
          return;
        }

        setProperty(data);
        setError(null);
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError("Erro ao carregar dados do imóvel");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  // Função para gerar features baseadas nos dados do imóvel
  const getPropertyFeatures = (property: any) => {
    if (!property) return [];
    
    const features = [
      { icon: Bed, label: `${property.bedrooms || 1} quarto${(property.bedrooms || 1) > 1 ? 's' : ''}` },
      { icon: Bath, label: `${property.bathrooms || 1} banheiro${(property.bathrooms || 1) > 1 ? 's' : ''}` }
    ];

    if (property.area_sqm) {
      features.push({ icon: Home, label: `${property.area_sqm}m²` });
    }

    // Adicionar features baseadas nas amenities
    if (property.amenities?.includes('Internet Wi-Fi') || property.amenities?.includes('Internet')) {
      features.push({ icon: Wifi, label: "Internet" });
    }

    return features;
  };

  const handleWhatsAppClick = () => {
    if (!property) return;
    const message = `Olá! Tenho interesse no imóvel "${property.title}" que vi no KITNET.IA. Poderia me dar mais informações?`;
    const phone = "5511999999999"; // Número do proprietário
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                KITNET.IA
              </h1>
              <Badge variant="secondary" className="hidden sm:block">
                Carregando...
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Skeleton className="w-full h-64 md:h-80 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <Skeleton className="w-full h-32 md:h-[152px] rounded-lg" />
              <Skeleton className="w-full h-32 md:h-[152px] rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-1/3 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                KITNET.IA
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Imóvel não encontrado</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/')}>
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Se não tem property, não renderiza nada
  if (!property) return null;

  // Determinar as imagens a serem exibidas
  const displayImages = property.images && property.images.length > 0 
    ? property.images 
    : placeholderImages;

  // Gerar features do imóvel
  const propertyFeatures = getPropertyFeatures(property);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              KITNET.IA
            </h1>
            <Badge variant="secondary" className="hidden sm:block">
              Disponível para locação
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Galeria de Imagens */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <img 
              src={displayImages[0]} 
              alt="Foto principal"
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {displayImages.slice(1, 3).map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`Foto ${index + 2}`}
                className="w-full h-32 md:h-[152px] object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações principais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold">{property.title}</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-primary">
                      R$ {property.rent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {propertyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <feature.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrição */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">Descrição</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Comodidades */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Comodidades</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar de contato */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Interessado?</h3>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato via WhatsApp
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleWhatsAppClick}
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Quero alugar via WhatsApp
                    </Button>

                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">
                        Resposta rápida • Chatbot inteligente
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-xs text-muted-foreground text-center">
                      Este imóvel é gerenciado por
                      <br />
                      <strong className="text-foreground">KITNET.IA</strong>
                      <br />
                      Tecnologia em automação de aluguéis
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot 
        propertyId={property.id} 
        propertyTitle={property.title}
      />

      {/* Botão fixo mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <Button 
          onClick={handleWhatsAppClick}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Quero alugar via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default PropertyPublic;