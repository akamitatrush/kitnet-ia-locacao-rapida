import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Ruler, Home, Car, Wifi, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  address: string;
  neighborhood: string;
  images: string[];
  amenities: string[];
  property_type: string;
}

interface PropertyComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: string[];
  onRemoveProperty: (propertyId: string) => void;
}

export const PropertyComparison = ({ 
  isOpen, 
  onClose, 
  selectedProperties, 
  onRemoveProperty 
}: PropertyComparisonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && selectedProperties.length > 0) {
      fetchProperties();
    }
  }, [isOpen, selectedProperties]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', selectedProperties)
        .eq('is_active', true);

      if (error) throw error;

      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar propriedades",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveComparison = async () => {
    if (!user) return;

    try {
      await supabase
        .from('property_comparisons')
        .insert({
          user_id: user.id,
          property_ids: selectedProperties,
        });

      toast({
        title: "Comparação salva!",
        description: "Você pode acessar suas comparações no seu perfil.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getUniqueAmenities = () => {
    const allAmenities = properties.flatMap(p => p.amenities || []);
    return [...new Set(allAmenities)];
  };

  const hasAmenity = (property: Property, amenity: string) => {
    return property.amenities?.includes(amenity) || false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Comparar Imóveis</h2>
          <div className="flex gap-2">
            {user && (
              <Button onClick={saveComparison} variant="outline" size="sm">
                Salvar Comparação
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">Carregando propriedades...</div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {properties.map((property) => (
                <Card key={property.id} className="relative">
                  <Button
                    onClick={() => onRemoveProperty(property.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={property.images?.[0] || '/placeholder.svg'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {property.neighborhood}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(property.rent)}/mês
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {property.bedrooms} quartos
                      </div>
                      <div className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {property.bathrooms} banheiros
                      </div>
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {property.area_sqm}m²
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="space-y-6">
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Comparação Detalhada</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Característica</th>
                        {properties.map((property) => (
                          <th key={property.id} className="text-left p-3 font-medium min-w-[200px]">
                            {property.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Preço</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-3">
                            <span className="text-lg font-semibold text-primary">
                              {formatPrice(property.rent)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3 font-medium">Tipo</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-3">
                            <Badge variant="secondary">{property.property_type}</Badge>
                          </td>
                        ))}
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3 font-medium">Quartos</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-3">{property.bedrooms}</td>
                        ))}
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3 font-medium">Banheiros</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-3">{property.bathrooms}</td>
                        ))}
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3 font-medium">Área (m²)</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-3">{property.area_sqm}</td>
                        ))}
                      </tr>
                      
                      <tr className="border-b">
                        <td className="p-3 font-medium">Localização</td>
                        {properties.map((property) => (
                          <td key={property.id} className="p-3">
                            <div className="text-sm">
                              <div>{property.neighborhood}</div>
                              <div className="text-muted-foreground">{property.address}</div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amenities Comparison */}
              {getUniqueAmenities().length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Comodidades</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Comodidade</th>
                          {properties.map((property) => (
                            <th key={property.id} className="text-center p-3 font-medium min-w-[200px]">
                              {property.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getUniqueAmenities().map((amenity) => (
                          <tr key={amenity} className="border-b">
                            <td className="p-3 font-medium">{amenity}</td>
                            {properties.map((property) => (
                              <td key={property.id} className="p-3 text-center">
                                {hasAmenity(property, amenity) ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                    <Plus className="w-3 h-3" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full">
                                    <Minus className="w-3 h-3" />
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};