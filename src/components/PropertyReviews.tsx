import React, { useState } from 'react';
import { Star, Plus, Edit, Trash2, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PropertyReviewsProps {
  propertyId: string;
}

export const PropertyReviews = ({ propertyId }: PropertyReviewsProps) => {
  const { user } = useAuth();
  const { reviews, loading, averageRating, totalReviews, createReview, updateReview, deleteReview } = useReviews(propertyId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    stay_duration: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reviewData = {
      property_id: propertyId,
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment || undefined,
      stay_duration: formData.stay_duration ? parseInt(formData.stay_duration) : undefined,
    };

    const success = editingReview 
      ? await updateReview(editingReview, reviewData)
      : await createReview(reviewData);

    if (success) {
      setIsCreateModalOpen(false);
      setEditingReview(null);
      setFormData({ rating: 5, title: '', comment: '', stay_duration: '' });
    }
  };

  const handleEdit = (review: any) => {
    setFormData({
      rating: review.rating,
      title: review.title,
      comment: review.comment || '',
      stay_duration: review.stay_duration?.toString() || '',
    });
    setEditingReview(review.id);
    setIsCreateModalOpen(true);
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderRatingInput = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setFormData({ ...formData, rating: i + 1 })}
            className="p-1"
          >
            <Star
              className={`w-6 h-6 ${
                i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando avaliações...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avaliações</span>
            {user && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Avaliar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingReview ? 'Editar Avaliação' : 'Nova Avaliação'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Nota</Label>
                      {renderRatingInput()}
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Resuma sua experiência"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="comment">Comentário (opcional)</Label>
                      <Textarea
                        id="comment"
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        placeholder="Conte mais sobre sua experiência..."
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="stay_duration">Tempo de permanência (meses - opcional)</Label>
                      <Input
                        id="stay_duration"
                        type="number"
                        min="1"
                        value={formData.stay_duration}
                        onChange={(e) => setFormData({ ...formData, stay_duration: e.target.value })}
                        placeholder="Ex: 12"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingReview ? 'Atualizar' : 'Publicar'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          setEditingReview(null);
                          setFormData({ rating: 5, title: '', comment: '', stay_duration: '' });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{averageRating}</span>
                <div className="flex">
                  {renderStars(Math.round(averageRating), 'w-5 h-5')}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.reviewer_profile?.avatar_url} />
                    <AvatarFallback>
                      {review.reviewer_profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{review.reviewer_profile?.full_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(new Date(review.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                      {review.stay_duration && (
                        <>
                          <span>•</span>
                          <span>{review.stay_duration} {review.stay_duration === 1 ? 'mês' : 'meses'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {review.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      Verificada
                    </Badge>
                  )}
                  {user?.id === review.reviewer_id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(review)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteReview(review.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <h5 className="font-medium">{review.title}</h5>
                </div>
                
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};