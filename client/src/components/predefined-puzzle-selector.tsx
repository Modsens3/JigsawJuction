import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

interface PredefinedPuzzleSelectorProps {
  onPuzzleSelect: (puzzle: PredefinedPuzzle) => void;
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

export function PredefinedPuzzleSelector({ onPuzzleSelect }: PredefinedPuzzleSelectorProps) {
  const [puzzles, setPuzzles] = useState<PredefinedPuzzle[]>([]);
  const [filteredPuzzles, setFilteredPuzzles] = useState<PredefinedPuzzle[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPuzzles();
  }, []);

  useEffect(() => {
    filterPuzzles();
  }, [puzzles, selectedType, selectedDifficulty]);

  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/predefined-puzzles', 'GET');
      setPuzzles(data);
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των puzzle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPuzzles = () => {
    let filtered = puzzles;

    if (selectedType) {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    setFilteredPuzzles(filtered);
  };

  const handlePuzzleSelect = (puzzle: PredefinedPuzzle) => {
    onPuzzleSelect(puzzle);
    toast({
      title: "Επιλογή",
      description: `Επιλέξατε: ${puzzle.name}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε τύπο" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Όλοι οι τύποι</SelectItem>
              <SelectItem value="round">Στρογγυλό</SelectItem>
              <SelectItem value="octagon">Οκτάγωνο</SelectItem>
              <SelectItem value="square">Τετράγωνο</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε δυσκολία" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Όλα τα επίπεδα</SelectItem>
              <SelectItem value="easy">Εύκολο</SelectItem>
              <SelectItem value="medium">Μέτριο</SelectItem>
              <SelectItem value="hard">Δύσκολο</SelectItem>
              <SelectItem value="very_hard">Πολύ Δύσκολο</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Βρέθηκαν {filteredPuzzles.length} puzzle
      </div>

      {/* Puzzles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPuzzles.map((puzzle) => (
          <Card key={puzzle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden">
              <img
                src={puzzle.imageUrl}
                alt={puzzle.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{puzzle.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {puzzle.description}
                  </CardDescription>
                </div>
                {puzzle.featured === 1 && (
                  <Badge variant="secondary" className="ml-2">
                    Προτεινόμενο
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Τύπος:</span>
                  <Badge variant="outline">{TYPE_LABELS[puzzle.type]}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Δυσκολία:</span>
                  <Badge className={DIFFICULTY_COLORS[puzzle.difficulty]}>
                    {DIFFICULTY_LABELS[puzzle.difficulty]}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Κομμάτια:</span>
                  <span className="font-medium">{puzzle.pieces}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Τιμή:</span>
                  <span className="font-bold text-lg">€{puzzle.basePrice.toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={() => handlePuzzleSelect(puzzle)}
                  className="w-full"
                >
                  Επιλογή
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPuzzles.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Δεν βρέθηκαν puzzle με τα επιλεγμένα κριτήρια
          </p>
        </div>
      )}
    </div>
  );
}
