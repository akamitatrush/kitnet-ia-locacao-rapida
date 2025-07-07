import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const ChatbotDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    income: '',
    urgency: '',
    pets: '',
    location: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatFlow = [
    { question: "Olá! 👋 Sou a assistente virtual da KITNET.IA. Qual seu nome?", field: 'name' },
    { question: "Prazer em conhecê-lo! Qual sua renda mensal aproximada?", field: 'income' },
    { question: "Para quando você precisa do imóvel?", field: 'urgency' },
    { question: "Você tem pets? Se sim, quais?", field: 'pets' },
    { question: "Qual região você prefere?", field: 'location' }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Olá! 👋 Sou a assistente virtual da KITNET.IA. Qual seu nome?");
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    addUserMessage(input);
    
    // Update user data
    const currentField = chatFlow[currentStep]?.field;
    if (currentField) {
      setUserData(prev => ({ ...prev, [currentField]: input }));
    }

    // Bot response logic
    setTimeout(() => {
      if (currentStep < chatFlow.length - 1) {
        setCurrentStep(prev => prev + 1);
        addBotMessage(chatFlow[currentStep + 1].question);
      } else {
        // Final message with qualification
        const qualification = qualifyLead();
        addBotMessage(`Perfeito! Baseado nas suas respostas, ${qualification.message}`);
        
        if (qualification.qualified) {
          setTimeout(() => {
            addBotMessage("📅 Gostaria de agendar uma visita? Tenho horários disponíveis para amanhã às 14h ou 16h.");
          }, 1500);
        }
      }
    }, 1000);

    setInput('');
  };

  const qualifyLead = () => {
    const income = parseInt(userData.income.replace(/\D/g, ''));
    const isUrgent = userData.urgency.toLowerCase().includes('urgente') || 
                     userData.urgency.toLowerCase().includes('imediato') ||
                     userData.urgency.toLowerCase().includes('agora');

    if (income >= 2000 && isUrgent) {
      return {
        qualified: true,
        message: "você tem um perfil excelente para nossas kitnets! 🎉"
      };
    } else if (income >= 1500) {
      return {
        qualified: true,
        message: "você pode se interessar por algumas de nossas opções disponíveis."
      };
    } else {
      return {
        qualified: false,
        message: "agradeço seu interesse. No momento não temos kitnets que se encaixem no seu perfil, mas te aviso quando tivermos!"
      };
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96">
          <Card className="h-full flex flex-col shadow-2xl border-0 bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">KITNET.IA Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua resposta..."
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatbotDemo;