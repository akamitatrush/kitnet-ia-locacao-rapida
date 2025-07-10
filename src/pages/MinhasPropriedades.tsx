import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from '@/components/Layout';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Bed, 
  Bath, 
  DollarSign,
  Copy,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import PropertyRegistrationModal from '@/components/PropertyRegistrationModal';

interface Property {
  id: string;
  title: string;
  address: string;
  neighborhood: string | null;
  rent: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  property_type: string;
  images: string[] | null;
  is_active: boolean;
  created_at: string;
}

const MinhasPropriedades = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== 'owner')) {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user && profile?.user_type === 'owner') {
      loadProperties();
    }
  }, [user, profile]);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus imóveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePropertyStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: !currentStatus })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => 
        prev.map(p => 
          p.id === propertyId 
            ? { ...p, is_active: !currentStatus }
            : p
        )
      );

      toast({
        title: "Status atualizado!",
        description: `Imóvel ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do imóvel.",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      
      toast({
        title: "Imóvel removido!",
        description: "O imóvel foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar imóvel:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o imóvel.",
        variant: "destructive",
      });
    }
  };

  const copyPropertyLink = (propertyId: string) => {
    const link = `${window.location.origin}/imovel/${propertyId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link do imóvel copiado para a área de transferência.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (authLoading || loading) {
    return (
      <Layout showSidebar>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || profile?.user_type !== 'owner') {
    return null;
  }

  return (
    <Layout showSidebar>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Imóveis</h1>
            <p className="text-gray-600">Gerencie seu portfólio de propriedades</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Imóvel</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Imóveis</p>
                  <p className="text-2xl font-bold text-blue-600">{properties.length}</p>
                </div>
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {properties.filter(p => p.is_active).length}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita Potencial</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {properties.filter(p => p.is_active).reduce((sum, p) => sum + p.rent, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum imóvel cadastrado
              </h3>
              <p className="text-gray-500 mb-6">
                Comece cadastrando seu primeiro imóvel para atrair inquilinos.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Primeiro Imóvel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg truncate mr-2">{property.title}</CardTitle>
                    <Badge 
                      variant={property.is_active ? "default" : "secondary"}
                      className={property.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {property.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{property.address}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Property Details */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4">
                      {property.bedrooms && (
                        <div className="flex items-center text-gray-600">
                          <Bed className="w-4 h-4 mr-1" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center text-gray-600">
                          <Bath className="w-4 h-4 mr-1" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">{property.property_type}</Badge>
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-green-600">
                    R$ {property.rent.toLocaleString()}
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-500">
                    Criado em {formatDate(property.created_at)}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPropertyLink(property.id)}
                      className="flex-1"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar Link
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link to={`/imovel/${property.id}`} target="_blank">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver Página
                      </Link>
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePropertyStatus(property.id, property.is_active)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {property.is_active ? 'Desativar' : 'Ativar'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Imóvel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este imóvel? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProperty(property.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Property Registration Modal */}
        <PropertyRegistrationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            loadProperties();
          }}
        />
      </div>
    </Layout>
  );
};

export default MinhasPropriedades;