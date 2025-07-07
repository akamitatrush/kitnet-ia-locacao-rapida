import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio de e-mail
    setTimeout(() => {
      setIsEmailSent(true);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setIsLoading(false);
    }, 1500);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              KITNET.IA
            </h1>
          </div>

          <Card className="shadow-lg border-0 text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                E-mail enviado!
              </CardTitle>
              <CardDescription className="text-base">
                Enviamos instruções para redefinir sua senha para:
                <br />
                <strong className="text-foreground">{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.
                  <br /><br />
                  Não recebeu? Verifique o spam ou tente novamente.
                </p>
              </div>

              <Button asChild variant="outline" className="w-full h-11">
                <Link to="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            KITNET.IA
          </h1>
          <p className="mt-2 text-muted-foreground">
            Redefinir senha
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              Digite seu e-mail e enviaremos instruções para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar instruções por e-mail"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;