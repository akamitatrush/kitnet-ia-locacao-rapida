import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PropertyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyRegistrationModal = ({ isOpen, onClose }: PropertyRegistrationModalProps) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    // Property info
    address: '',
    neighborhood: '',
    city: '',
    rent: '',
    condo: '',
    iptu: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    amenities: [] as string[],
    photos: [] as File[]
  });

  const amenitiesList = [
    'Wi-Fi', 'Ar Condicionado', 'Mobiliado', 'Churrasqueira', 
    'Piscina', 'Academia', 'Garagem', 'Elevador', 
    'Portaria 24h', 'Pet Friendly', 'Lavanderia', 'Varanda'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Validações de arquivo
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      return `${file.name}: Arquivo muito grande (máximo 5MB)`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return `${file.name}: Formato não suportado (apenas JPG, PNG, WEBP)`;
    }
    
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Erro nos arquivos",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...validFiles] }));
    }

    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para cadastrar um imóvel.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      let imageUrls: string[] = [];

      // Upload das imagens se houver
      if (formData.photos.length > 0) {
        toast({
          title: "Fazendo upload das imagens...",
          description: "Por favor, aguarde enquanto as imagens são enviadas.",
        });

        const totalFiles = formData.photos.length;
        
        for (let i = 0; i < formData.photos.length; i++) {
          const file = formData.photos[i];
          const fileName = `${Date.now()}_${i}_${file.name}`;
          const filePath = `${user.id}/${fileName}`;

          try {
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Erro no upload:', uploadError);
              throw new Error(`Erro ao fazer upload de ${file.name}: ${uploadError.message}`);
            }

            if (uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(uploadData.path);
              
              imageUrls.push(publicUrl);
            }

            // Atualizar progress
            const progress = Math.round(((i + 1) / totalFiles) * 100);
            setUploadProgress(progress);

          } catch (fileError) {
            console.error(`Erro no arquivo ${file.name}:`, fileError);
            toast({
              title: "Erro no upload",
              description: `Falha ao enviar ${file.name}. Continuando com outras imagens...`,
              variant: "destructive",
            });
          }
        }
      }

      setIsUploading(false);

      // Cadastrar o imóvel com as URLs das imagens
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            user_id: user.id,
            title: `${formData.bedrooms} quarto(s) em ${formData.neighborhood}`,
            description: formData.description,
            address: formData.address,
            neighborhood: formData.neighborhood,
            rent: parseFloat(formData.rent),
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            area_sqm: formData.area ? parseInt(formData.area) : null,
            amenities: formData.amenities,
            images: imageUrls.length > 0 ? imageUrls : null,
            property_type: 'Kitnet',
            is_active: true
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao cadastrar imóvel:', error);
        
        // Se deu erro no cadastro mas já fez upload de imagens, tentar limpar
        if (imageUrls.length > 0) {
          try {
            const filesToDelete = imageUrls.map(url => {
              const urlParts = url.split('/');
              return `${user.id}/${urlParts[urlParts.length - 1]}`;
            });
            
            await supabase.storage
              .from('property-images')
              .remove(filesToDelete);
          } catch (cleanupError) {
            console.error('Erro ao limpar imagens:', cleanupError);
          }
        }

        toast({
          title: "Erro ao cadastrar imóvel",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso! 🎉",
        description: `Seu imóvel foi cadastrado com sucesso${imageUrls.length > 0 ? ` com ${imageUrls.length} imagem(ns)` : ''}!`,
      });

      // Reset form
      setFormData({
        address: '', neighborhood: '', city: '',
        rent: '', condo: '', iptu: '', area: '',
        bedrooms: '', bathrooms: '', description: '',
        amenities: [], photos: []
      });
      setCurrentStep(1);
      setUploadProgress(0);
      onClose();
      
      // Refresh the page to show the new property
      window.location.reload();

    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: error.message || "Tente novamente em alguns momentos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.address && formData.neighborhood && formData.rent;
      case 2:
        return formData.bedrooms && formData.bathrooms && formData.area;
      case 3:
        return formData.description;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Cadastro de Imóvel
          </DialogTitle>
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Basic Property Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
              
              <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1"
                    placeholder="São Paulo"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rent">Valor do Aluguel (R$)</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.rent}
                  onChange={(e) => handleInputChange('rent', e.target.value)}
                  className="mt-1"
                  placeholder="1200"
                />
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Características do Imóvel</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    className="mt-1"
                    placeholder="45"
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Quartos</Label>
                  <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange('bedrooms', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Quarto</SelectItem>
                      <SelectItem value="2">2 Quartos</SelectItem>
                      <SelectItem value="3">3 Quartos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bathrooms">Banheiros</Label>
                  <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange('bathrooms', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Banheiro</SelectItem>
                      <SelectItem value="2">2 Banheiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condo">Condomínio (R$)</Label>
                  <Input
                    id="condo"
                    type="number"
                    value={formData.condo}
                    onChange={(e) => handleInputChange('condo', e.target.value)}
                    className="mt-1"
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="iptu">IPTU (R$)</Label>
                  <Input
                    id="iptu"
                    type="number"
                    value={formData.iptu}
                    onChange={(e) => handleInputChange('iptu', e.target.value)}
                    className="mt-1"
                    placeholder="80"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Description and Photos */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Descrição e Fotos</h3>
              
              <div>
                <Label htmlFor="description">Descrição do Imóvel</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva as principais características do imóvel..."
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label>Comodidades</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {amenitiesList.map((amenity) => (
                    <Button
                      key={amenity}
                      type="button"
                      variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleAmenityToggle(amenity)}
                      className="text-xs"
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Fotos do Imóvel</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                       <Upload className="w-8 h-8 mb-4 text-gray-500" />
                       <p className="mb-2 text-sm text-gray-500">
                         <span className="font-semibold">Clique para enviar</span> ou arraste as fotos
                       </p>
                       <p className="text-xs text-gray-400">
                         JPG, PNG, WEBP • Máx 5MB por arquivo
                       </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-gray-600">Fazendo upload das imagens...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              <div className="text-xs text-gray-500 text-center">
                {uploadProgress}% concluído
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Voltar
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!isStepComplete()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepComplete() || isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyRegistrationModal;