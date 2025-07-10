import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, MapPin, DollarSign, Home } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  search: string;
  propertyType: string;
  minRent: number;
  maxRent: number;
  bedrooms: string;
  bathrooms: string;
  neighborhood: string;
}

const defaultFilters: SearchFilters = {
  search: '',
  propertyType: '',
  minRent: 0,
  maxRent: 5000,
  bedrooms: '',
  bathrooms: '',
  neighborhood: '',
};

export const SearchFilters = ({ onFiltersChange, className }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.minRent, filters.maxRent]);

  const propertyTypes = ['Kitnet', 'Apartamento', 'Casa', 'Studio'];
  const bedroomOptions = ['1', '2', '3', '4+'];
  const bathroomOptions = ['1', '2', '3+'];

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const clearFilters = () => {
    const cleared = { ...defaultFilters };
    setFilters(cleared);
    setPriceRange([cleared.minRent, cleared.maxRent]);
    onFiltersChange(cleared);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    updateFilters({ minRent: value[0], maxRent: value[1] });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'minRent' && value === 0) return false;
    if (key === 'maxRent' && value === 5000) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-white/40 shadow-lg ${className}`}>
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar por endereço, bairro ou características..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros Avançados</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="w-4 h-4 inline mr-1" />
                  Tipo de Imóvel
                </label>
                <Select value={filters.propertyType} onValueChange={(value) => updateFilters({ propertyType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartos</label>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilters({ bedrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banheiros</label>
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilters({ bathrooms: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer</SelectItem>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Faixa de Preço: R$ {priceRange[0].toLocaleString()} - R$ {priceRange[1].toLocaleString()}
              </label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={5000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>R$ 0</span>
                <span>R$ 5.000+</span>
              </div>
            </div>

            {/* Neighborhood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Bairro
              </label>
              <Input
                type="text"
                placeholder="Digite o bairro desejado"
                value={filters.neighborhood}
                onChange={(e) => updateFilters({ neighborhood: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.propertyType && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <span>{filters.propertyType}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilters({ propertyType: '' })} 
                />
              </Badge>
            )}
            {filters.bedrooms && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <span>{filters.bedrooms} quartos</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilters({ bedrooms: '' })} 
                />
              </Badge>
            )}
            {filters.bathrooms && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <span>{filters.bathrooms} banheiros</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilters({ bathrooms: '' })} 
                />
              </Badge>
            )}
            {(filters.minRent > 0 || filters.maxRent < 5000) && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <span>R$ {filters.minRent} - R$ {filters.maxRent}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => {
                    setPriceRange([0, 5000]);
                    updateFilters({ minRent: 0, maxRent: 5000 });
                  }} 
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};