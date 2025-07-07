import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PropertyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyRegistrationModal = ({ isOpen, onClose }: PropertyRegistrationModalProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Owner info
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
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

  const handleSubmit = () => {
    console.log('Formulário submetido:', formData);
    
    // Simulate API call
    toast({
      title: "Sucesso! 🎉",
      description: "Seu imóvel foi cadastrado. O chatbot já está ativo!",
    });
    
    console.log('Toast enviado');
    
    // Reset form and close
    setFormData({
      ownerName: '', ownerEmail: '', ownerPhone: '',
      address: '', neighborhood: '', city: '',
      rent: '', condo: '', iptu: '', area: '',
      bedrooms: '', bathrooms: '', description: '',
      amenities: [], photos: []
    });
    setCurrentStep(1);
    onClose();
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.ownerName && formData.ownerEmail && formData.ownerPhone;
      case 2:
        return formData.address && formData.neighborhood && formData.rent && formData.area;
      case 3:
        return formData.description && formData.photos.length > 0;
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
          {/* Step 1: Owner Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Seus Dados</h3>
              
              <div>
                <Label htmlFor="ownerName">Nome Completo</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ownerEmail">E-mail</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ownerPhone">WhatsApp</Label>
                <Input
                  id="ownerPhone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.ownerPhone}
                  onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Dados do Imóvel</h3>
              
              <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1"
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rent">Aluguel (R$)</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={formData.rent}
                    onChange={(e) => handleInputChange('rent', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="condo">Condomínio (R$)</Label>
                  <Input
                    id="condo"
                    type="number"
                    value={formData.condo}
                    onChange={(e) => handleInputChange('condo', e.target.value)}
                    className="mt-1"
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
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    className="mt-1"
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
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
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
                disabled={!isStepComplete()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Finalizar Cadastro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyRegistrationModal;