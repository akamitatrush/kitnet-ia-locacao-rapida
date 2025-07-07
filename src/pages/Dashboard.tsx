import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home, Users, TrendingUp, MessageCircle, Clock, DollarSign, 
  Eye, Share2, Settings, Plus, Star, MapPin, Calendar, Phone,
  Copy, ExternalLink, CheckCircle, AlertCircle, UserCheck
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - em produção viria da API
  const [properties] = useState([
    {
      id: 1,
      title: "Kitnet Centro - Rua Augusta",
      address: "Rua Augusta, 123 - Centro, São Paulo",
      rent: 1200,
      status: "available",
      leads: 8,
      views: 45,
      photos: 6,
      link: "https://kitnet.ia/p/augusta-123",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Studio Vila Madalena",
      address: "Rua Harmonia, 456 - Vila Madalena, São Paulo",
      rent: 1800,
      status: "rented",
      leads: 12,
      views: 78,
      photos: 8,
      link: "https://kitnet.ia/p/harmonia-456",
      createdAt: "2024-01-10"
    }
  ]);

  const [leads] = useState([
    {
      id: 1,
      name: "Maria Silva",
      phone: "(11) 99999-1234",
      income: 3500,
      urgency: "urgente",
      score: "A",
      property: "Kitnet Centro - Rua Augusta",
      status: "qualified",
      lastContact: "2024-01-20 14:30",
      conversation: "Interessada, tem renda compatível, precisa para março."
    },
    {
      id: 2,
      name: "João Santos",
      phone: "(11) 99999-5678",
      income: 2800,
      urgency: "30 dias",
      score: "B",
      property: "Studio Vila Madalena",
      status: "pending",
      lastContact: "2024-01-20 10:15",
      conversation: "Renda ok, quer agendar visita no final de semana."
    },
    {
      id: 3,
      name: "Ana Costa",
      phone: "(11) 99999-9999",
      income: 1500,
      urgency: "não urgente",
      score: "C",
      property: "Kitnet Centro - Rua Augusta",
      status: "rejected",
      lastContact: "2024-01-19 16:45",
      conversation: "Renda insuficiente para o imóvel desejado."
    }
  ]);

  const [metrics] = useState({
    totalProperties: 2,
    totalLeads: 20,
    qualifiedLeads: 8,
    conversionRate: 40,
    averageTime: 7,
    monthlyRevenue: 3000
  });

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
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Imóveis</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalProperties}</p>
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
                  <p className="text-2xl font-bold text-indigo-600">{metrics.totalLeads}</p>
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
                  <p className="text-2xl font-bold text-green-600">{metrics.qualifiedLeads}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{metrics.conversionRate}%</p>
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
                  <p className="text-2xl font-bold text-orange-600">{metrics.averageTime}d</p>
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
                  <p className="text-2xl font-bold text-green-600">R${metrics.monthlyRevenue}</p>
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
                      
                      <div className="grid grid-cols-3 gap-4">
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

                      <div className="flex space-x-2">
                        <Button className="flex-1" variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                          <Share2 className="w-4 h-4 mr-2" />
                          Divulgar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;