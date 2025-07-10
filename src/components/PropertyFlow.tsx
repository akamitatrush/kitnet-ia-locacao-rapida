import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Home, MapPin, Calendar, Users, MessageCircle, DollarSign, 
  Eye, Share2, Clock, TrendingUp, ArrowRight, CheckCircle,
  AlertCircle, Phone, User, Star, Copy, ExternalLink, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface PropertyFlowProps {
  propertyId: string;
  onBack: () => void;
}

interface PropertyDetails {
  id: string;
  title: string;
  address: string;
  rent: number;
  status: string;
  createdAt: string;
  images: string[];
  description: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
}

interface ConversationData {
  id: string;
  createdAt: string;
  visitorInfo: any;
  conversationHistory: any[];
  leadQualified: boolean;
}

interface TimelineEvent {
  id: string;
  type: 'property_created' | 'conversation_started' | 'lead_qualified' | 'view_registered';
  date: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

export const PropertyFlow = ({ propertyId, onBack }: PropertyFlowProps) => {
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyFlow();
  }, [propertyId]);

  const fetchPropertyFlow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch property details
      const { data: propertyData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .eq('user_id', user.id)
        .single();

      if (propertyData) {
        setProperty({
          id: propertyData.id,
          title: propertyData.title,
          address: propertyData.address,
          rent: propertyData.rent,
          status: propertyData.is_active ? 'available' : 'inactive',
          createdAt: propertyData.created_at,
          images: propertyData.images || [],
          description: propertyData.description || '',
          neighborhood: propertyData.neighborhood || '',
          bedrooms: propertyData.bedrooms || 1,
          bathrooms: propertyData.bathrooms || 1,
          area_sqm: propertyData.area_sqm || 0,
        });
      }

      // Fetch conversations for this property
      const { data: conversationsData } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true });

      if (conversationsData) {
        const processedConversations = conversationsData.map(conv => ({
          id: conv.id,
          createdAt: conv.created_at,
          visitorInfo: conv.visitor_info,
          conversationHistory: conv.conversation_history || [],
          leadQualified: conv.lead_qualified || false,
        }));
        setConversations(processedConversations);
      }

      // Create timeline
      createTimeline(propertyData, conversationsData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching property flow:', error);
      setLoading(false);
    }
  };

  const createTimeline = (propertyData: any, conversationsData: any[]) => {
    const events: TimelineEvent[] = [];

    // Property creation
    if (propertyData) {
      events.push({
        id: 'property-created',
        type: 'property_created',
        date: propertyData.created_at,
        title: 'Imóvel Cadastrado',
        description: `${propertyData.title} foi criado no sistema`,
        icon: Home,
        color: 'blue',
      });
    }

    // Conversations and leads
    conversationsData.forEach((conv, index) => {
      events.push({
        id: `conversation-${conv.id}`,
        type: 'conversation_started',
        date: conv.created_at,
        title: 'Nova Conversa',
        description: `Visitante #${index + 1} iniciou conversa com Sofia IA`,
        icon: MessageCircle,
        color: 'purple',
      });

      if (conv.lead_qualified) {
        events.push({
          id: `lead-${conv.id}`,
          type: 'lead_qualified',
          date: conv.created_at,
          title: 'Lead Qualificado',
          description: 'Sofia IA qualificou um lead interessado',
          icon: CheckCircle,
          color: 'green',
        });
      }
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setTimeline(events);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/imovel/${propertyId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link do imóvel copiado para a área de transferência.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'inactive': return 'Inativo';
      default: return 'Indefinido';
    }
  };

  const getEventColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'green': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Imóvel não encontrado</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const totalViews = Math.floor(Math.random() * 100) + 20; // Simulated for now
  const qualifiedLeads = conversations.filter(c => c.leadQualified).length;
  const conversionRate = conversations.length > 0 ? Math.round((qualifiedLeads / conversations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Fluxo do Imóvel</h2>
            <p className="text-gray-600">Acompanhe toda a jornada desde o cadastro até a conversão</p>
          </div>
        </div>
      </div>

      {/* Property Overview */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{property.title}</CardTitle>
              <CardDescription className="flex items-center space-x-1 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address}</span>
              </CardDescription>
            </div>
            <Badge className={getStatusColor(property.status)}>
              {getStatusText(property.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">R$ {property.rent}</p>
              <p className="text-sm text-gray-600">Aluguel/mês</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
              <p className="text-sm text-gray-600">Visualizações</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{conversations.length}</p>
              <p className="text-sm text-gray-600">Conversas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
              <p className="text-sm text-gray-600">Conversão</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Link público do imóvel:</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm text-gray-700 truncate">
                {`${window.location.origin}/imovel/${property.id}`}
              </code>
              <Button size="sm" variant="outline" onClick={copyLink}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`/imovel/${property.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Timeline de Atividades</span>
            </CardTitle>
            <CardDescription>
              Histórico completo desde o cadastro do imóvel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {timeline.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getEventColor(event.color)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                    </div>
                  </div>
                );
              })}
              {timeline.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade registrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leads Details */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Leads Gerados</span>
            </CardTitle>
            <CardDescription>
              Detalhes dos interessados neste imóvel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversations.map((conv, index) => {
                const visitorInfo = conv.visitorInfo as any;
                let name = `Visitante #${index + 1}`;
                let phone = '';
                
                if (visitorInfo?.raw_data) {
                  const nameMatch = visitorInfo.raw_data.match(/([A-Za-z\s]+)/);
                  if (nameMatch) name = nameMatch[1].trim();
                  
                  const phoneMatch = visitorInfo.raw_data.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
                  if (phoneMatch) phone = phoneMatch[0];
                }

                return (
                  <div key={conv.id} className="border rounded-lg p-4 bg-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">{name}</span>
                      </div>
                      {conv.leadQualified && (
                        <Badge className="bg-green-100 text-green-800">
                          Qualificado
                        </Badge>
                      )}
                    </div>
                    
                    {phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>{phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(conv.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {conv.conversationHistory.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600">
                          {conv.conversationHistory.length} mensagens trocadas
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {conversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma conversa iniciada ainda</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Os leads aparecerão aqui quando visitantes interagirem com Sofia IA
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Funil de Conversão</span>
          </CardTitle>
          <CardDescription>
            Visualize o caminho dos visitantes até a conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
              <p className="text-sm text-gray-600">Visualizações</p>
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{conversations.length}</p>
              <p className="text-sm text-gray-600">Conversas Iniciadas</p>
              {totalViews > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((conversations.length / totalViews) * 100)}% dos visitantes
                </p>
              )}
            </div>
            
            <div className="hidden md:flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{qualifiedLeads}</p>
              <p className="text-sm text-gray-600">Leads Qualificados</p>
              {conversations.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {conversionRate}% das conversas
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};