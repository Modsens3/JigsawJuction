import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Gift, Trophy, Crown, Clock, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function LoyaltyPage() {
  // Mock user for demo - in real app would come from auth
  const mockUser = {
    loyaltyPoints: 1250,
    loyaltyTier: 'gold',
    totalSpent: '345.50',
  };

  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/loyalty/transactions'],
    enabled: false, // Disabled until user auth is implemented
  });

  const tierInfo = {
    bronze: { name: 'Χάλκινος', min: 0, max: 500, color: 'bg-orange-500', benefits: ['5% έκπτωση', 'Δωρεάν μεταφορικά άνω €50'] },
    silver: { name: 'Ασημένιος', min: 500, max: 1000, color: 'bg-gray-400', benefits: ['10% έκπτωση', 'Προτεραιότητα στην εξυπηρέτηση', 'Δωρεάν μεταφορικά άνω €30'] },
    gold: { name: 'Χρυσός', min: 1000, max: 2000, color: 'bg-yellow-500', benefits: ['15% έκπτωση', 'Πρόσβαση σε αποκλειστικά σχέδια', 'Δωρεάν μεταφορικά πάντα'] },
    platinum: { name: 'Πλατινένιος', min: 2000, max: null, color: 'bg-purple-500', benefits: ['20% έκπτωση', 'Προσωπικός σύμβουλος', 'Αποκλειστικές εκδηλώσεις'] },
  };

  const currentTier = tierInfo[mockUser.loyaltyTier as keyof typeof tierInfo];
  const nextTier = mockUser.loyaltyTier === 'platinum' ? null : 
    tierInfo[mockUser.loyaltyTier === 'bronze' ? 'silver' : 
           mockUser.loyaltyTier === 'silver' ? 'gold' : 'platinum'];

  const progressToNext = nextTier ? 
    ((mockUser.loyaltyPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Πρόγραμμα Πιστότητας PuzzleCraft
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Κερδίστε πόντους και ανταμοιβές με κάθε αγορά fractal puzzle
        </p>
      </div>

      {/* Current Status */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            <CardTitle className="text-2xl">
              Κατηγορία: {currentTier.name}
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            {mockUser.loyaltyPoints} πόντοι διαθέσιμοι
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextTier && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Πρόοδος προς {nextTier.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {mockUser.loyaltyPoints}/{nextTier.min} πόντοι
                  </span>
                </div>
                <Progress value={progressToNext} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Χρειάζεστε {nextTier.min - mockUser.loyaltyPoints} πόντους ακόμη
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{mockUser.loyaltyPoints}</div>
                <div className="text-sm text-muted-foreground">Διαθέσιμοι Πόντοι</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">€{mockUser.totalSpent}</div>
                <div className="text-sm text-muted-foreground">Συνολικά Αγορές</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">15%</div>
                <div className="text-sm text-muted-foreground">Τρέχουσα Έκπτωση</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tiers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tiers" data-testid="tab-tiers">Κατηγορίες</TabsTrigger>
          <TabsTrigger value="rewards" data-testid="tab-rewards">Ανταμοιβές</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Ιστορικό</TabsTrigger>
        </TabsList>

        {/* Tier Information */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tierInfo).map(([tier, info]) => (
              <Card key={tier} className={`relative overflow-hidden ${mockUser.loyaltyTier === tier ? 'ring-2 ring-blue-500' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-2 ${info.color}`} />
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {tier === 'bronze' && <Star className="w-5 h-5 text-orange-500" />}
                    {tier === 'silver' && <Star className="w-5 h-5 text-gray-400" />}
                    {tier === 'gold' && <Star className="w-5 h-5 text-yellow-500" />}
                    {tier === 'platinum' && <Crown className="w-5 h-5 text-purple-500" />}
                    {info.name}
                  </CardTitle>
                  <CardDescription>
                    {info.min}+ πόντοι
                    {mockUser.loyaltyTier === tier && (
                      <Badge className="ml-2 bg-blue-500">Τρέχουσα</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {info.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Gift className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card data-testid="reward-free-shipping">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Δωρεάν Μεταφορικά
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600 mb-2">100 πόντοι</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Δωρεάν μεταφορικά για την επόμενη παραγγελία σας
                </p>
                <Button className="w-full" disabled={mockUser.loyaltyPoints < 100}>
                  Εξαργύρωση
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="reward-discount">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  Έκπτωση 10%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 mb-2">250 πόντοι</p>
                <p className="text-sm text-muted-foreground mb-4">
                  10% έκπτωση στην επόμενη αγορά σας
                </p>
                <Button className="w-full" disabled={mockUser.loyaltyPoints < 250}>
                  Εξαργύρωση
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="reward-exclusive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Αποκλειστικό Σχέδιο
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600 mb-2">500 πόντοι</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Πρόσβαση σε αποκλειστικό fractal σχέδιο
                </p>
                <Button className="w-full" disabled={mockUser.loyaltyPoints < 500}>
                  Εξαργύρωση
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="reward-custom-frame">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Δωρεάν Κάδρο
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600 mb-2">800 πόντοι</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Δωρεάν κάδρο premium για το puzzle σας
                </p>
                <Button className="w-full" disabled={mockUser.loyaltyPoints < 800}>
                  Εξαργύρωση
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="reward-consultation">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Προσωπική Συμβουλή
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-indigo-600 mb-2">1000 πόντοι</p>
                <p className="text-sm text-muted-foreground mb-4">
                  1 ώρα προσωπικής συμβουλής για fractal design
                </p>
                <Button className="w-full" disabled={mockUser.loyaltyPoints < 1000}>
                  Εξαργύρωση
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="reward-mystery-box">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-600" />
                  Mystery Box
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-pink-600 mb-2">1500 πόντοι</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Συλλογή 3 αποκλειστικών mini-puzzles
                </p>
                <Button className="w-full" disabled={mockUser.loyaltyPoints < 1500}>
                  Εξαργύρωση
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transaction History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ιστορικό Πόντων</CardTitle>
              <CardDescription>
                Δείτε πώς κερδίσατε και χρησιμοποιήσατε τους πόντους σας
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock transactions */}
                <div className="flex items-center justify-between py-3 border-b" data-testid="transaction-earned">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Αγορά puzzle - Mandelbrot Set</p>
                      <p className="text-sm text-muted-foreground">12 Αυγ 2025</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">+85 πόντοι</p>
                    <p className="text-xs text-muted-foreground">€85.00</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b" data-testid="transaction-redeemed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Εξαργύρωση - Δωρεάν Μεταφορικά</p>
                      <p className="text-sm text-muted-foreground">10 Αυγ 2025</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-semibold">-100 πόντοι</p>
                    <p className="text-xs text-muted-foreground">Εξοικονόμηση €8</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b" data-testid="transaction-bonus">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Bonus εγγραφής στο newsletter</p>
                      <p className="text-sm text-muted-foreground">5 Αυγ 2025</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">+50 πόντοι</p>
                    <p className="text-xs text-muted-foreground">Δώρο</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Πώς να κερδίσετε περισσότερους πόντους:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 1 πόντος για κάθε €1 που ξοδεύετε</li>
                  <li>• 50 πόντοι για κάθε κριτική που αφήνετε</li>
                  <li>• 100 πόντοι όταν προσκαλείτε φίλους</li>
                  <li>• 25 πόντοι για κοινοποίηση στα social media</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}