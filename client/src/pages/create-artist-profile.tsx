
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

const categories = {
  "Música": ["Cantante", "Banda", "DJ", "Músico"],
  "Arte Visual": ["Pintor", "Fotógrafo", "Ilustrador"],
  "Danza": ["Bailarín", "Coreógrafo"],
  "Teatro": ["Actor", "Director"],
  "Otros": ["Otro"]
};

export default function CreateArtistProfile() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    description: '',
    minPrice: '',
    maxPrice: '',
    priceUnit: 'hora'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = await import('firebase/auth');
      const currentUser = auth.getAuth().currentUser;
      
      if (!currentUser) {
        throw new Error('Must be logged in to create artist profile');
      }

      await apiRequest('POST', '/api/artists', {
        ...formData,
        userId: currentUser.uid,
        minPrice: parseInt(formData.minPrice),
        maxPrice: parseInt(formData.maxPrice)
      });
      setLocation('/profile');
    } catch (error) {
      console.error('Error creating artist profile:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Crear Perfil de Artista</CardTitle>
          <CardDescription>
            Completa la información para crear tu perfil profesional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.category && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoría</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData({...formData, subcategory: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[formData.category as keyof typeof categories].map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu experiencia y servicios"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Precio Mínimo</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="50000"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({...formData, minPrice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Precio Máximo</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="200000"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({...formData, maxPrice: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUnit">Unidad de Precio</Label>
              <Select
                value={formData.priceUnit}
                onValueChange={(value) => setFormData({...formData, priceUnit: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hora">Por Hora</SelectItem>
                  <SelectItem value="evento">Por Evento</SelectItem>
                  <SelectItem value="dia">Por Día</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Crear Perfil
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
