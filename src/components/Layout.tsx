import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Home, 
  Search, 
  Heart, 
  Settings, 
  User, 
  LogOut, 
  BarChart3,
  Bot,
  Menu,
  X,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout = ({ children, showSidebar = false }: LayoutProps) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/favoritos', label: 'Favoritos', icon: Heart, requireAuth: true },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, requireAuth: true, ownerOnly: true },
    { path: '/minhas-propriedades', label: 'Meus Imóveis', icon: Settings, requireAuth: true, ownerOnly: true },
    { path: '/mensagens', label: 'Mensagens', icon: MessageCircle, requireAuth: true },
    { path: '/visitas', label: 'Visitas', icon: Calendar, requireAuth: true },
    { path: '/configuracoes', label: 'Perfil', icon: User, requireAuth: true },
  ];

  const filteredItems = navigationItems.filter(item => {
    if (item.requireAuth && !user) return false;
    if (item.ownerOnly && profile?.user_type !== 'owner') return false;
    return true;
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-border/50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
              <Link to="/" className="flex items-center space-x-3 hover-lift">
                <div className="bg-gradient-primary text-primary-foreground p-2 rounded-xl shadow-medium">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-2xl font-display font-bold">
                  <span className="gradient-text">KITNET</span>
                  <span className="text-accent">.IA</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {filteredItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`hover-lift focus-ring transition-all duration-200 ${
                    isActive(item.path) 
                      ? "bg-gradient-primary text-primary-foreground shadow-medium" 
                      : "hover:bg-muted/80"
                  }`}
                >
                  <Link to={item.path} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 hidden sm:block">
                    Olá, {profile?.full_name || 'Usuário'}
                  </span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="outline" size="sm" className="hover-lift">
                    <Link to="/signup">Cadastrar</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-gradient-primary hover:shadow-medium button-glow">
                    <Link to="/login">Entrar</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {showSidebar && sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 glass-effect shadow-large pt-16">
            <div className="p-4 space-y-2">
              {filteredItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Link to={item.path} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-20">
        {children}
      </div>
    </div>
  );
};