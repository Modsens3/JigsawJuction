import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Pause, Square, Clock, Trophy, Share2, Camera, Plus, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ProgressTrackerPage() {
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Mock puzzle progress data
  const mockProgress = [
    {
      id: "1",
      puzzleName: "Mandelbrot Dreams",
      totalPieces: 1000,
      completedPieces: 650,
      completionPercentage: 65,
      timeSpentMinutes: 780,
      startedAt: new Date("2025-08-01"),
      difficulty: "Δύσκολο",
      material: "Ξύλο Premium",
      size: "50x70cm",
      imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      notes: "Το κεντρικό τμήμα είναι πολύ δύσκολο. Ξεκίνησα από τις άκρες.",
      isShared: true,
    },
    {
      id: "2", 
      puzzleName: "Golden Spiral",
      totalPieces: 750,
      completedPieces: 375,
      completionPercentage: 50,
      timeSpentMinutes: 420,
      startedAt: new Date("2025-08-05"),
      difficulty: "Μέτριο",
      material: "Ακρυλικό",
      size: "40x60cm", 
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      notes: "Πολύ όμορφα χρώματα. Βοηθάει η ταξινόμηση κατά χρώμα.",
      isShared: false,
    },
    {
      id: "3",
      puzzleName: "Julia Universe", 
      totalPieces: 500,
      completedPieces: 500,
      completionPercentage: 100,
      timeSpentMinutes: 480,
      startedAt: new Date("2025-07-20"),
      completedAt: new Date("2025-08-02"),
      difficulty: "Εύκολο",
      material: "Χαρτόνι Premium",
      size: "30x45cm",
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      notes: "Τέλεια για αρχάριους. Τα κομμάτια ταιριάζουν εύκολα.",
      isShared: true,
    }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ώ ${mins}λ`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Εύκολο': return 'bg-green-100 text-green-800';
      case 'Μέτριο': return 'bg-yellow-100 text-yellow-800'; 
      case 'Δύσκολο': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const startTimer = (puzzleId: string) => {
    setActiveTimer(puzzleId);
    setTimerStartTime(Date.now());
  };

  const stopTimer = () => {
    if (activeTimer && timerStartTime) {
      const sessionTime = Math.floor((Date.now() - timerStartTime) / 60000);
      // Here you would update the progress via API
      console.log(`Stopped timer for ${activeTimer}, session time: ${sessionTime} minutes`);
    }
    setActiveTimer(null);
    setTimerStartTime(null);
  };

  const completedPuzzles = mockProgress.filter(p => p.completionPercentage === 100);
  const activePuzzles = mockProgress.filter(p => p.completionPercentage < 100);
  const totalTimeSpent = mockProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0);
  const averageCompletionTime = completedPuzzles.length > 0 
    ? Math.floor(completedPuzzles.reduce((sum, p) => sum + p.timeSpentMinutes, 0) / completedPuzzles.length)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Παρακολούθηση Προόδου
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Παρακολουθήστε την πρόοδό σας, μετρήστε τον χρόνο και κοινοποιήστε τις επιτυχίες σας
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedPuzzles.length}</div>
            <div className="text-sm text-muted-foreground">Ολοκληρωμένα</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{activePuzzles.length}</div>
            <div className="text-sm text-muted-foreground">Σε Εξέλιξη</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
            <div className="text-sm text-muted-foreground">Συνολικός Χρόνος</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Play className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatTime(averageCompletionTime)}</div>
            <div className="text-sm text-muted-foreground">Μέσος Χρόνος</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" data-testid="tab-active">Σε Εξέλιξη ({activePuzzles.length})</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Ολοκληρωμένα ({completedPuzzles.length})</TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">Στατιστικά</TabsTrigger>
        </TabsList>

        {/* Active Puzzles */}
        <TabsContent value="active" className="space-y-4">
          {activePuzzles.map((puzzle) => (
            <Card key={puzzle.id} className="overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="relative">
                  <img 
                    src={puzzle.imageUrl}
                    alt={puzzle.puzzleName}
                    className="w-full h-48 lg:h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={getDifficultyColor(puzzle.difficulty)}>
                      {puzzle.difficulty}
                    </Badge>
                  </div>
                  {activeTimer === puzzle.id && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      🔴 LIVE
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{puzzle.puzzleName}</h3>
                      <p className="text-muted-foreground">{puzzle.material} • {puzzle.size}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{puzzle.completionPercentage}%</div>
                      <div className="text-sm text-muted-foreground">
                        {puzzle.completedPieces}/{puzzle.totalPieces} κομμάτια
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Πρόοδος</span>
                        <span className="text-sm text-muted-foreground">{puzzle.completedPieces}/{puzzle.totalPieces}</span>
                      </div>
                      <Progress value={puzzle.completionPercentage} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Χρόνος:</span>
                        <div className="font-semibold">{formatTime(puzzle.timeSpentMinutes)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ξεκίνησε:</span>
                        <div className="font-semibold">{puzzle.startedAt.toLocaleDateString('el-GR')}</div>
                      </div>
                    </div>

                    {puzzle.notes && (
                      <div className="bg-muted p-3 rounded">
                        <span className="text-sm font-medium">Σημειώσεις: </span>
                        <span className="text-sm">{puzzle.notes}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {activeTimer === puzzle.id ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={stopTimer}
                          data-testid={`stop-timer-${puzzle.id}`}
                        >
                          <Square className="w-4 h-4 mr-2" />
                          Στοπ
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startTimer(puzzle.id)}
                          disabled={activeTimer !== null}
                          data-testid={`start-timer-${puzzle.id}`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Έναρξη
                        </Button>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" data-testid={`update-progress-${puzzle.id}`}>
                            <Plus className="w-4 h-4 mr-2" />
                            Ενημέρωση
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ενημέρωση Προόδου</DialogTitle>
                            <DialogDescription>
                              Ενημερώστε την πρόοδό σας για το {puzzle.puzzleName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Ολοκληρωμένα κομμάτια</Label>
                              <input 
                                type="number" 
                                max={puzzle.totalPieces}
                                defaultValue={puzzle.completedPieces}
                                className="w-full p-2 border rounded mt-1"
                                data-testid="input-completed-pieces"
                              />
                            </div>
                            <div>
                              <Label>Σημειώσεις</Label>
                              <Textarea 
                                defaultValue={puzzle.notes}
                                placeholder="Προσθέστε σημειώσεις για την πρόοδό σας..."
                                data-testid="textarea-notes"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">Ακύρωση</Button>
                              <Button data-testid="button-save-progress">Αποθήκευση</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`share-progress-${puzzle.id}`}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {activePuzzles.length === 0 && (
            <Card className="text-center py-16">
              <CardContent>
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Δεν έχετε ενεργά puzzle</h3>
                <p className="text-muted-foreground mb-6">
                  Αρχίστε ένα νέο puzzle για να παρακολουθήσετε την πρόοδό σας
                </p>
                <Button data-testid="button-start-new-puzzle">
                  Ξεκινήστε Νέο Puzzle
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Completed Puzzles */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedPuzzles.map((puzzle) => (
              <Card key={puzzle.id} className="overflow-hidden">
                <div className="relative">
                  <img 
                    src={puzzle.imageUrl}
                    alt={puzzle.puzzleName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Ολοκληρώθηκε
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className={getDifficultyColor(puzzle.difficulty)}>
                      {puzzle.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg">{puzzle.puzzleName}</CardTitle>
                  <CardDescription>{puzzle.material} • {puzzle.size}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Χρόνος ολοκλήρωσης:</span>
                      <span className="font-semibold">{formatTime(puzzle.timeSpentMinutes)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ολοκληρώθηκε:</span>
                      <span className="font-semibold">
                        {puzzle.completedAt?.toLocaleDateString('el-GR')}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Κομμάτια:</span>
                      <span className="font-semibold">{puzzle.totalPieces}</span>
                    </div>

                    {puzzle.notes && (
                      <div className="bg-muted p-2 rounded text-sm">
                        {puzzle.notes}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        data-testid={`share-completion-${puzzle.id}`}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Κοινοποίηση
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`view-gallery-${puzzle.id}`}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Statistics */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Στατιστικά Επίδοσης</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Συνολικά puzzles:</span>
                  <span className="font-semibold">{mockProgress.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ποσοστό ολοκλήρωσης:</span>
                  <span className="font-semibold">{Math.round((completedPuzzles.length / mockProgress.length) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Μέσος χρόνος ολοκλήρωσης:</span>
                  <span className="font-semibold">{formatTime(averageCompletionTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Συνολικά κομμάτια:</span>
                  <span className="font-semibold">{mockProgress.reduce((sum, p) => sum + p.totalPieces, 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Επιτεύγματα</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <div>
                    <div className="font-semibold">Πρώτο Ολοκληρωμένο</div>
                    <div className="text-sm text-muted-foreground">Ολοκληρώσατε το πρώτο σας puzzle!</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold">Ταχύτητα Αστραπή</div>
                    <div className="text-sm text-muted-foreground">Ολοκληρώσατε puzzle σε &lt;8 ώρες</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded opacity-50">
                  <Target className="w-6 h-6 text-gray-500" />
                  <div>
                    <div className="font-semibold">Μαραθώνιος</div>
                    <div className="text-sm text-muted-foreground">Ολοκληρώστε 10 puzzles (3/10)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}