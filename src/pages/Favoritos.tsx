import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Home, 
  ArrowLeft,
  Trash2,
  HeartOff
} from 'lucide-react';

interface FavoriteProperty {
  id: string;
  property_id: string;
  properties: {
    id: string;
    title: string;
    address: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
    images: string[] | null;
  };
}

const Favoritos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingFavorite, setRemovingFavorite] = useState<string | null>(null);

  // Placeholder images para quando não há imagens
  const placeholderImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          property_id,
          properties (
            id,
            title,
            address,
            rent,
            bedrooms,
            bathrooms,
            area_sqm,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar favoritos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus favoritos.",
          variant: "destructive",
        });
        return;
      }

      // Filtrar apenas favoritos com propriedades válidas
      const validFavorites = (data || []).filter(fav => fav.properties) as FavoriteProperty[];
      setFavorites(validFavorites);

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, propertyTitle: string) => {
    if (!user) return;

    try {
      setRemovingFavorite(favoriteId);
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover favorito:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o favorito.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar lista local
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Favorito removido",
        description: `"${propertyTitle}" foi removido dos seus favoritos.`,
      });

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    } finally {
      setRemovingFavorite(null);
    }
  };

  const navigateToProperty = (propertyId: string) => {
    navigate(`/imovel/${propertyId}`);
  };

  const getDisplayImage = (images: string[] | null) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return placeholderImages[0];
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Meus Favoritos
                </h1>
                <p className="text-gray-600">Seus imóveis salvos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeletons */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-8 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Meus Favoritos
                </h1>
                <p className="text-gray-600">
                  {favorites.length > 0 
                    ? `${favorites.length} imóvel${favorites.length > 1 ? 'eis' : ''} salvo${favorites.length > 1 ? 's' : ''}`
                    : 'Nenhum imóvel salvo ainda'
                  }
                </p>
              </div>
            </div>
            
            {favorites.length > 0 && (
              <div className="flex items-center space-x-2 text-red-600">
                <Heart className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">{favorites.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          // Empty state
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <HeartOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Nenhum favorito ainda
              </h2>
              <p className="text-gray-600 mb-6">
                Explore nossos imóveis e clique no ❤️ para salvá-los aqui.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Explorar Imóveis
              </Button>
            </div>
          </div>
        ) : (
          // Properties grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const property = favorite.properties;
              return (
                <Card 
                  key={favorite.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white/60 backdrop-blur-sm border-white/40"
                >
                  <div className="relative">
                    <img
                      src={getDisplayImage(property.images)}
                      alt={property.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => navigateToProperty(property.id)}
                    />
                    
                    {/* Remove favorite button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(favorite.id, property.title);
                      }}
                      disabled={removingFavorite === favorite.id}
                    >
                      {removingFavorite === favorite.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>

                    {/* Favorite indicator */}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500/90 text-white">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        Favorito
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4" onClick={() => navigateToProperty(property.id)}>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {property.rent.toLocaleString('pt-BR')}
                          <span className="text-sm text-gray-500 font-normal">/mês</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms} quarto{property.bedrooms > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms} banheiro{property.bathrooms > 1 ? 's' : ''}</span>
                        </div>
                        {property.area_sqm && (
                          <div className="flex items-center space-x-1">
                            <Home className="w-4 h-4" />
                            <span>{property.area_sqm}m²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favoritos;