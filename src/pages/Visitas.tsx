import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AuthProvider } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVisitRequests } from '@/hooks/useVisitRequests';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Visitas = () => {
  const { user, profile } = useAuth();
  const { visitRequests, updateVisitRequest, cancelVisitRequest } = useVisitRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [action, setAction] = useState<'confirm' | 'reject' | null>(null);

  const handleResponse = async () => {
    if (!selectedRequest || !action) return;

    const success = await updateVisitRequest(selectedRequest.id, {
      status: action === 'confirm' ? 'confirmed' : 'rejected',
      owner_response: response,
    });

    if (success) {
      setSelectedRequest(null);
      setResponse('');
      setAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      confirmed: { label: 'Confirmada', variant: 'default' as const },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const },
      completed: { label: 'Realizada', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const pendingRequests = visitRequests.filter(req => req.status === 'pending');
  const otherRequests = visitRequests.filter(req => req.status !== 'pending');

  return (
    <AuthProvider>
      <Layout showSidebar>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Agendamento de Visitas</h1>
            </div>

            {/* Pending Requests */}
            {profile?.user_type === 'owner' && pendingRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Clock className="w-5 h-5" />
                    Solicitações Pendentes ({pendingRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{request.property?.title}</h3>
                          <p className="text-sm text-muted-foreground">{request.property?.address}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Interessado:</p>
                          <p className="text-sm">{request.visitor_profile?.full_name}</p>
                          {request.visitor_profile?.phone && (
                            <p className="text-sm text-muted-foreground">
                              {request.visitor_profile.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium">Data preferida:</p>
                          <p className="text-sm">
                            {format(new Date(request.preferred_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          {request.alternative_date && (
                            <div className="mt-1">
                              <p className="text-sm font-medium">Alternativa:</p>
                              <p className="text-sm">
                                {format(new Date(request.alternative_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {request.visitor_message && (
                        <div>
                          <p className="text-sm font-medium">Mensagem:</p>
                          <p className="text-sm text-muted-foreground">{request.visitor_message}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setAction('confirm');
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedRequest(request);
                            setAction('reject');
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* All Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {profile?.user_type === 'owner' ? 'Todas as Solicitações' : 'Minhas Solicitações'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {profile?.user_type === 'owner' 
                        ? 'Nenhuma solicitação de visita ainda.'
                        : 'Você ainda não solicitou nenhuma visita.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visitRequests.map((request) => {
                      const isOwner = user?.id === request.owner_id;
                      const otherUser = isOwner ? request.visitor_profile : request.owner_profile;

                      return (
                        <div key={request.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{request.property?.title}</h3>
                              <p className="text-sm text-muted-foreground">{request.property?.address}</p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">
                                {isOwner ? 'Interessado:' : 'Proprietário:'}
                              </p>
                              <p className="text-sm">{otherUser?.full_name}</p>
                            </div>

                            <div>
                              <p className="text-sm font-medium">Data solicitada:</p>
                              <p className="text-sm">
                                {format(new Date(request.preferred_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>

                          {request.owner_response && (
                            <div>
                              <p className="text-sm font-medium">Resposta do proprietário:</p>
                              <p className="text-sm text-muted-foreground">{request.owner_response}</p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {request.status === 'confirmed' && isOwner && (
                              <Button
                                onClick={() => updateVisitRequest(request.id, { status: 'completed' })}
                                size="sm"
                                variant="outline"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Marcar como Realizada
                              </Button>
                            )}
                            
                            {request.status === 'pending' && !isOwner && (
                              <Button
                                onClick={() => cancelVisitRequest(request.id)}
                                variant="outline"
                                size="sm"
                              >
                                Cancelar Solicitação
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Response Modal */}
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {action === 'confirm' ? 'Confirmar Visita' : 'Rejeitar Visita'}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <p className="font-medium">{selectedRequest?.property?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Solicitado por: {selectedRequest?.visitor_profile?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Data: {selectedRequest && format(new Date(selectedRequest.preferred_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Mensagem de resposta (opcional):</label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder={
                      action === 'confirm' 
                        ? 'Ex: Visita confirmada! Aguardo você no horário marcado.'
                        : 'Ex: Infelizmente não posso atender neste horário. Que tal tentarmos outro dia?'
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleResponse} className="flex-1">
                    {action === 'confirm' ? 'Confirmar Visita' : 'Rejeitar Visita'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRequest(null);
                      setResponse('');
                      setAction(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </AuthProvider>
  );
};

export default Visitas;