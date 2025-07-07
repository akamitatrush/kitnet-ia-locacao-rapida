import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Home, Users, TrendingUp, MessageCircle, Clock, DollarSign, 
  Eye, Share2, Settings, Plus, Star, MapPin, Calendar, Phone,
  Copy, ExternalLink, CheckCircle, AlertCircle, UserCheck, Filter, BarChart3
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { usePropertyAnalytics } from "@/hooks/usePropertyAnalytics";
import { useRecentLeads } from "@/hooks/useRecentLeads";
import { PropertyFlow } from "@/components/PropertyFlow";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Real data from Supabase
  const metrics = useDashboardMetrics(dateFilter);
  const { properties, loading: propertiesLoading } = usePropertyAnalytics();
  const { leads, loading: leadsLoading } = useRecentLeads();

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link do imóvel copiado para a área de transferência.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'rented': return 'Alugado';
      case 'maintenance': return 'Manutenção';
      default: return 'Indefinido';
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getLeadStatusIcon = (status: string) => {
    switch (status) {
      case 'qualified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return UserCheck;
    }
  };

  // Show PropertyFlow if a property is selected
  if (selectedPropertyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Fluxo detalhado do imóvel</p>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <PropertyFlow 
            propertyId={selectedPropertyId} 
            onBack={() => setSelectedPropertyId(null)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Bem-vindo de volta, Sérgio!</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Imóvel
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Imóveis</p>
                  {metrics.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">{metrics.totalProperties}</p>
                  )}
                </div>
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  {metrics.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-indigo-600">{metrics.totalLeads}</p>
                  )}
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Qualificados</p>
                  {metrics.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">{metrics.qualifiedLeads}</p>
                  )}
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversão</p>
                  {metrics.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{metrics.conversionRate}%</p>
                  )}
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  {metrics.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-orange-600">{metrics.averageTime}d</p>
                  )}
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receita</p>
                  {metrics.loading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">R$ {metrics.monthlyRevenue.toLocaleString()}</p>
                  )}
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="properties">Meus Imóveis</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Atividade Recente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Lead qualificado</p>
                        <p className="text-xs text-gray-600">Maria Silva se interessou pelo imóvel da Rua Augusta</p>
                        <p className="text-xs text-gray-500">há 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Novo interesse</p>
                        <p className="text-xs text-gray-600">3 pessoas visualizaram seu imóvel hoje</p>
                        <p className="text-xs text-gray-500">há 4 horas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Share2 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Link compartilhado</p>
                        <p className="text-xs text-gray-600">Seu imóvel foi compartilhado 5 vezes no WhatsApp</p>
                        <p className="text-xs text-gray-500">ontem</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Property */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Imóvel em Destaque</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Kitnet Centro - Rua Augusta</h3>
                        <p className="text-sm text-gray-600">Rua Augusta, 123</p>
                        <p className="text-lg font-bold text-green-600 mt-2">R$ 1.200/mês</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">45</p>
                        <p className="text-xs text-gray-600">Visualizações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">8</p>
                        <p className="text-xs text-gray-600">Leads</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {propertiesLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties.map((property) => (
                <Card key={property.id} className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{property.title}</CardTitle>
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-green-600">R$ {property.rent}</span>
                        <span className="text-sm text-gray-600">/mês</span>
                      </div>
                      
                        <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{property.views}</p>
                          <p className="text-xs text-gray-600">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-indigo-600">{property.leads}</p>
                          <p className="text-xs text-gray-600">Leads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{property.photos}</p>
                          <p className="text-xs text-gray-600">Fotos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{property.conversionRate}%</p>
                          <p className="text-xs text-gray-600">Conversão</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">Link do imóvel:</p>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm text-gray-700 truncate">
                            {property.link}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(property.link)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex space-x-2 mb-3">
                        <Button 
                          className="flex-1" 
                          variant="outline"
                          onClick={() => setSelectedPropertyId(property.id)}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Ver Fluxo
                        </Button>
                        <Button className="flex-1" variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                        <Share2 className="w-4 h-4 mr-2" />
                        Divulgar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            {leadsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum lead qualificado ainda</h3>
                  <p className="text-gray-500">Seus leads qualificados aparecerão aqui conforme a Sofia IA conversar com interessados.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => {
                const StatusIcon = getLeadStatusIcon(lead.status);
                return (
                  <Card key={lead.id} className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{lead.name}</h3>
                            <Badge className={getScoreColor(lead.score)}>
                              Score {lead.score}
                            </Badge>
                            <div className={`flex items-center space-x-1 ${getLeadStatusColor(lead.status)}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="text-sm capitalize">{lead.status}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Telefone:</p>
                              <p className="font-medium">{lead.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Renda:</p>
                              <p className="font-medium">R$ {lead.income}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Urgência:</p>
                              <p className="font-medium">{lead.urgency}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Último contato:</p>
                              <p className="font-medium">{lead.lastContact}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Imóvel de interesse:</p>
                            <p className="font-medium">{lead.property}</p>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600">Resumo da conversa:</p>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{lead.conversation}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Phone className="w-4 h-4 mr-2" />
                            Ligar
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Agendar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;