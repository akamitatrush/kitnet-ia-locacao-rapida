
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Home, Bot, Filter, FileText, Star, Users, Clock, TrendingUp, Phone, Mail, MapPin } from 'lucide-react';
import ChatbotDemo from '@/components/ChatbotDemo';
import PropertyRegistrationModal from '@/components/PropertyRegistrationModal';

const Index = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [selectedPropertyCount, setSelectedPropertyCount] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const openLeadModal = () => setIsLeadModalOpen(true);
  const closeLeadModal = () => setIsLeadModalOpen(false);
  const openPropertyModal = () => setIsPropertyModalOpen(true);
  const closePropertyModal = () => setIsPropertyModalOpen(false);

  const features = [
    {
      icon: Home,
      title: "Cadastro Rápido",
      description: "Cadastre seus imóveis em minutos com fotos e informações essenciais."
    },
    {
      icon: Bot,
      title: "Ativação do Chatbot",
      description: "Nosso chatbot inteligente começa a atender interessados pelo WhatsApp."
    },
    {
      icon: Filter,
      title: "Qualificação Automática",
      description: "A IA qualifica os leads e entrega apenas os melhores candidatos."
    },
    {
      icon: FileText,
      title: "Fechamento Digital",
      description: "Agende visitas ou feche contratos com assinatura digital direto pelo app."
    }
  ];

  const benefits = [
    "Atende automaticamente interessados pelo WhatsApp 24/7",
    "Qualifica os interessados com inteligência artificial",
    "Economiza tempo e reduz drasticamente a vacância",
    "Gera contratos com assinatura digital integrada",
    "Elimina a necessidade de corretores imobiliários",
    "Dashboard intuitivo para acompanhar todas as suas unidades"
  ];

  const testimonials = [
    {
      name: "Carlos Mendes",
      properties: "5 kitnets em SP",
      content: "Minha vacância caiu de 45 para 7 dias em média. A IA qualifica tão bem os leads que só recebo visitas de pessoas realmente interessadas.",
      rating: 5
    },
    {
      name: "Fernanda Oliveira",
      properties: "3 kitnets em BH",
      content: "Finalmente parei de perder tempo com ligações fora de hora. O chatbot responde todas as perguntas e só me aciona quando é realmente necessário.",
      rating: 5
    },
    {
      name: "Roberto Santos",
      properties: "8 kitnets no RJ",
      content: "A assinatura digital do contrato foi o que mais me surpreendeu. Fecho locações em qualquer lugar, sem papelada e com validade jurídica.",
      rating: 5
    }
  ];

  const stats = [
    { icon: TrendingUp, value: "5x", label: "Mais rápido" },
    { icon: Users, value: "500+", label: "Proprietários" },
    { icon: Clock, value: "24/7", label: "Atendimento" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">
                <span className="text-blue-600">KITNET</span>
                <span className="text-indigo-500">.IA</span>
              </span>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={openPropertyModal}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-full transition-all duration-300"
              >
                Cadastrar Imóvel
              </Button>
              <Button 
                onClick={openLeadModal}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Testar Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`pt-32 pb-20 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Alugue suas Kitnets <span className="block">5x mais rápido com IA</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              O jeito inteligente de manter seus imóveis sempre ocupados. Automatize atendimento, qualificação de leads e fechamento de contratos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={openPropertyModal}
                className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Cadastrar Imóvel
              </Button>
              <Button 
                onClick={openLeadModal}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Testar Grátis
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Como o KITNET.IA funciona</h2>
            <p className="text-xl text-gray-600">Automatize todo o processo de locação em apenas 4 passos simples</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Vantagens de usar KITNET.IA</h2>
              <p className="text-xl text-gray-600">Descubra como nossa solução transforma a gestão de kitnets</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-full flex-shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={openPropertyModal}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Cadastrar Primeiro Imóvel
                </Button>
                <Button 
                  onClick={openLeadModal}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Quero testar grátis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">O que nossos usuários dizem</h2>
            <p className="text-xl text-gray-600">Depoimentos de proprietários que já usam KITNET.IA</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg text-gray-800">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.properties}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-6">"{testimonial.content}"</p>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para revolucionar como você aluga suas kitnets?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">Junte-se a centenas de proprietários que já reduziram a vacância e simplificaram a locação com IA</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={openPropertyModal}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Cadastrar meu primeiro imóvel
            </Button>
            <Button 
              onClick={openLeadModal}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
            >
              Testar o Chatbot
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-xl">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold">
                  <span className="text-white">KITNET</span>
                  <span className="text-indigo-400">.IA</span>
                </span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">A solução inteligente para proprietários de kitnets que querem alugar mais rápido e com menos trabalho.</p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors cursor-pointer">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors cursor-pointer">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Links Rápidos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Depoimentos</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6">Para Investidores</h3>
              <p className="text-gray-300 mb-6">Quer apoiar a revolução do aluguel com IA?</p>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-full transition-all duration-300">
                Fale conosco
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KITNET.IA. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Lead Registration Modal */}
      <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Teste Grátis
            </DialogTitle>
            <p className="text-gray-600 text-center">Experimente nosso chatbot de qualificação agora</p>
          </DialogHeader>
          
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            alert('Cadastro realizado! Acesse o chatbot na tela principal.');
            closeLeadModal();
          }}>
            <div>
              <Label htmlFor="leadName">Nome Completo</Label>
              <Input id="leadName" type="text" required className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="leadEmail">E-mail</Label>
              <Input id="leadEmail" type="email" required className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="leadWhatsapp">WhatsApp</Label>
              <Input id="leadWhatsapp" type="tel" placeholder="(00) 00000-0000" required className="mt-1" />
            </div>
            
            <div>
              <Label>Quantos imóveis você tem?</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['1', '2-5', '6+'].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={selectedPropertyCount === count ? "default" : "outline"}
                    onClick={() => setSelectedPropertyCount(count)}
                    className="h-12"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 mt-6"
              disabled={!selectedPropertyCount}
            >
              Testar Chatbot Grátis
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Property Registration Modal */}
      <PropertyRegistrationModal 
        isOpen={isPropertyModalOpen} 
        onClose={closePropertyModal} 
      />

      {/* Chatbot Demo */}
      <ChatbotDemo />
    </div>
  );
};

export default Index;
