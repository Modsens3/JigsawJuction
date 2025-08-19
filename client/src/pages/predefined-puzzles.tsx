import React, { useState } from 'react';
import { PredefinedPuzzleSelector } from '@/components/predefined-puzzle-selector';
import ProductConfigurator from '@/components/product-configurator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useLocation } from 'wouter';

interface PredefinedPuzzle {
  id: string;
  name: string;
  description: string;
  type: 'round' | 'octagon' | 'square';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  pieces: number;
  imageUrl: string;
  basePrice: number;
  featured: number;
}

const TYPE_LABELS = {
  round: 'Στρογγυλό',
  octagon: 'Οκτάγωνο',
  square: 'Τετράγωνο',
} as const;

const DIFFICULTY_LABELS = {
  easy: 'Εύκολο',
  medium: 'Μέτριο',
  hard: 'Δύσκολο',
  very_hard: 'Πολύ Δύσκολο',
} as const;

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-orange-100 text-orange-800',
  very_hard: 'bg-red-100 text-red-800',
} as const;

export default function PredefinedPuzzlesPage() {
  const [, setLocation] = useLocation();
  const [selectedPuzzle, setSelectedPuzzle] = useState<PredefinedPuzzle | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);

  const handlePuzzleSelect = (puzzle: PredefinedPuzzle) => {
    setSelectedPuzzle(puzzle);
    setShowConfigurator(true);
  };

  const handleBackToSelection = () => {
    setSelectedPuzzle(null);
    setShowConfigurator(false);
  };

  if (showConfigurator && selectedPuzzle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToSelection}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Επιστροφή στην επιλογή
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedPuzzle.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {selectedPuzzle.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Badge variant="outline">{TYPE_LABELS[selectedPuzzle.type]}</Badge>
                  <Badge className={DIFFICULTY_COLORS[selectedPuzzle.difficulty]}>
                    {DIFFICULTY_LABELS[selectedPuzzle.difficulty]}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={selectedPuzzle.imageUrl}
                    alt={selectedPuzzle.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Κομμάτια:</span>
                    <span className="font-medium text-lg">{selectedPuzzle.pieces}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Βασική τιμή:</span>
                    <span className="font-bold text-xl">€{selectedPuzzle.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="pt-4">
                    <Button 
                      onClick={() => setShowConfigurator(false)}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Προσαρμογή και Παραγγελία
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ProductConfigurator 
          predefinedPuzzle={selectedPuzzle}
          onBack={handleBackToSelection}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => setLocation('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Επιστροφή στην αρχική
        </Button>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Προκαθορισμένα Puzzle</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Επιλέξτε από την ποικιλία μας με προκαθορισμένα puzzle σε διάφορα σχήματα και επίπεδα δυσκολίας
          </p>
        </div>
      </div>

      <PredefinedPuzzleSelector onPuzzleSelect={handlePuzzleSelect} />
    </div>
  );
}
