import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Crown } from "lucide-react";

const Configuracoes = () => {
  const [formData, setFormData] = useState({
    fullName: "Sérgio Hasher",
    email: "sergio@lognullsec.com",
    whatsapp: "(11) 99999-9999"
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular salvamento
    setTimeout(() => {
      toast({
        title: "Configurações salvas!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações da Conta</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        {/* Informações da Conta */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
            <CardDescription>
              Atualize suas informações de contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Este número será usado pelo chatbot para comunicação com os leads
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full md:w-auto h-11 px-8"
                disabled={isLoading}
              >
                {isLoading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Plano Atual */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Plano Atual</span>
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura e recursos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">Plano Gratuito</h3>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Até 2 imóveis • Leads ilimitados • Suporte por e-mail
                </p>
              </div>
              <Button variant="outline">
                Fazer upgrade
              </Button>
            </div>
            
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Recursos inclusos:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Chatbot IA para qualificação de leads</li>
                <li>✅ Dashboard de gestão</li>
                <li>✅ Links personalizados para imóveis</li>
                <li>✅ Relatórios básicos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Zona de Perigo */}
        <Card className="shadow-lg border-0 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis da conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <h4 className="font-medium">Excluir conta</h4>
                  <p className="text-sm text-muted-foreground">
                    Remove permanentemente sua conta e todos os dados
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Excluir conta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;