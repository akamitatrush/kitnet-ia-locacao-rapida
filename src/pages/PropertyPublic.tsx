import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import AIChatbot from "@/components/AIChatbot";
import { 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  Home, 
  MessageCircle,
  Phone 
} from "lucide-react";

const PropertyPublic = () => {
  const { propertyName } = useParams();

  // Dados mockados do imóvel
  const property = {
    name: "Kitnet Studio Centro",
    price: "R$ 1.200",
    location: "Centro, São Paulo - SP",
    description: "Linda kitnet mobiliada no centro de São Paulo. Perfeita para estudantes e profissionais. Próxima ao metrô e universidades.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
    ],
    features: [
      { icon: Bed, label: "1 quarto" },
      { icon: Bath, label: "1 banheiro" },
      { icon: Car, label: "Sem vaga" },
      { icon: Wifi, label: "Internet" },
      { icon: Home, label: "Mobiliado" }
    ],
    amenities: [
      "Ar condicionado",
      "Geladeira",
      "Microondas",
      "Cama box",
      "Guarda-roupa",
      "Internet Wi-Fi",
      "Portaria 24h",
      "Próximo ao metrô"
    ]
  };

  const handleWhatsAppClick = () => {
    const message = `Olá! Tenho interesse na kitnet "${property.name}" que vi no KITNET.IA. Poderia me dar mais informações?`;
    const phone = "5511999999999"; // Número do proprietário
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
              src={property.images[0]} 
              alt="Foto principal"
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            {property.images.slice(1).map((image, index) => (
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
                    <h1 className="text-2xl font-bold">{property.name}</h1>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-primary">
                      {property.price}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {property.features.map((feature, index) => (
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
        propertyId="1" 
        propertyTitle={property.name}
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