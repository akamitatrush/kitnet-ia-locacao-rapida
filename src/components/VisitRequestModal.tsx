import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVisitRequests } from '@/hooks/useVisitRequests';
import { format } from 'date-fns';

interface VisitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  ownerId: string;
  propertyTitle: string;
}

export const VisitRequestModal = ({ 
  isOpen, 
  onClose, 
  propertyId, 
  ownerId, 
  propertyTitle 
}: VisitRequestModalProps) => {
  const { createVisitRequest } = useVisitRequests();
  const [formData, setFormData] = useState({
    preferred_date: '',
    preferred_time: '',
    alternative_date: '',
    alternative_time: '',
    visitor_message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const preferredDateTime = new Date(`${formData.preferred_date}T${formData.preferred_time}`);
      const alternativeDateTime = formData.alternative_date && formData.alternative_time 
        ? new Date(`${formData.alternative_date}T${formData.alternative_time}`)
        : undefined;

      const success = await createVisitRequest({
        property_id: propertyId,
        owner_id: ownerId,
        preferred_date: preferredDateTime.toISOString(),
        alternative_date: alternativeDateTime?.toISOString(),
        visitor_message: formData.visitor_message || undefined,
      });

      if (success) {
        setFormData({
          preferred_date: '',
          preferred_time: '',
          alternative_date: '',
          alternative_time: '',
          visitor_message: '',
        });
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const minTime = '08:00';
  const maxTime = '18:00';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agendar Visita
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {propertyTitle}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Data e horário preferidos *
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  min={today}
                  required
                />
                <Input
                  type="time"
                  value={formData.preferred_time}
                  onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                  min={minTime}
                  max={maxTime}
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Data e horário alternativos (opcional)
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="date"
                  value={formData.alternative_date}
                  onChange={(e) => setFormData({ ...formData, alternative_date: e.target.value })}
                  min={today}
                />
                <Input
                  type="time"
                  value={formData.alternative_time}
                  onChange={(e) => setFormData({ ...formData, alternative_time: e.target.value })}
                  min={minTime}
                  max={maxTime}
                  disabled={!formData.alternative_date}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium">
                Mensagem adicional (opcional)
              </Label>
              <Textarea
                id="message"
                value={formData.visitor_message}
                onChange={(e) => setFormData({ ...formData, visitor_message: e.target.value })}
                placeholder="Adicione informações que possam ajudar o proprietário (ex: melhor forma de contato, observações especiais...)"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  Horário de visitas
                </p>
                <p className="text-blue-600 dark:text-blue-300">
                  Das 8h às 18h, de segunda a sábado
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Solicitar Visita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};