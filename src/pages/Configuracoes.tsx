import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Layout } from '@/components/Layout';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Shield, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Configuracoes = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    user_type: 'visitor' as 'owner' | 'visitor',
    avatar_url: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        user_type: profile.user_type || 'visitor',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await updateProfile(formData);
      
      if (!error) {
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout showSidebar>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email?.[0].toUpperCase() || 'U';

  return (
    <Layout showSidebar>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Foto do Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label htmlFor="avatar_url">URL da Foto</Label>
                    <Input
                      id="avatar_url"
                      type="url"
                      placeholder="https://exemplo.com/sua-foto.jpg"
                      value={formData.avatar_url}
                      onChange={(e) => handleChange('avatar_url', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Cole a URL de uma imagem para usar como foto do perfil
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
                <CardDescription>
                  Atualize suas informações básicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="user_type">Tipo de Usuário</Label>
                  <Select value={formData.user_type} onValueChange={(value: 'owner' | 'visitor') => handleChange('user_type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">Inquilino</SelectItem>
                      <SelectItem value="owner">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Proprietários podem cadastrar e gerenciar imóveis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Informações da Conta</span>
                </CardTitle>
                <CardDescription>
                  Informações de acesso (somente leitura)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>E-mail</span>
                  </Label>
                  <Input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <div>
                  <Label>Status da Conta</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Conta Verificada</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;