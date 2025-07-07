import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Verify = () => {
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
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-green-700">
              Conta ativada com sucesso!
            </CardTitle>
            <CardDescription className="text-base">
              Parabéns! Sua conta foi ativada com sucesso. 
              Agora você pode fazer login e começar a automatizar seus aluguéis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✅ E-mail verificado<br/>
                ✅ Conta ativada<br/>
                ✅ Pronto para usar
              </p>
            </div>

            <Button asChild className="w-full h-11 text-base font-medium">
              <Link to="/login">
                Fazer login agora
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground">
              Você receberá um e-mail de boas-vindas em breve com dicas para começar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;