import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Configuracoes from "./pages/Configuracoes";
import Favoritos from "./pages/Favoritos";
import PropertyPublic from "./pages/PropertyPublic";
import MinhasPropriedades from "./pages/MinhasPropriedades";
import NotFound from "./pages/NotFound";
import Mensagens from "./pages/Mensagens";
import Visitas from "./pages/Visitas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/minhas-propriedades" element={<MinhasPropriedades />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/visitas" element={<Visitas />} />
          <Route path="/imovel/:propertyId" element={<PropertyPublic />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
