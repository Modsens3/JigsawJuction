import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, Gift, Star, Truck, Pause, Play, X, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [selectedDifficulty, setSelectedDifficulty] = useState("mixed");
  const [selectedMaterial, setSelectedMaterial] = useState("mixed");
  const queryClient = useQueryClient();

  // Mock subscription data
  const mockSubscription = {
    id: "sub_1",
    planType: "monthly",
    status: "active",
    puzzlesPerDelivery: 2,
    preferredDifficulty: "mixed",
    preferredMaterial: "premium",
    monthlyPrice: "89.99",
    nextDelivery: new Date("2025-09-01"),
    startedAt: new Date("2025-06-01"),
  };

  // Mock delivery history
  const mockDeliveries = [
    {
      id: "del_1",
      deliveryDate: new Date("2025-08-01"),
      puzzles: [
        { name: "Cosmic Mandelbrot", difficulty: "Δύσκολο", pieces: 1000, material: "Ξύλο Premium" },
        { name: "Golden Spiral Mini", difficulty: "Μέτριο", pieces: 500, material: "Ακρυλικό" }
      ],
      status: "delivered",
      rating: 5
    },
    {
      id: "del_2", 
      deliveryDate: new Date("2025-07-01"),
      puzzles: [
        { name: "Julia Dreams", difficulty: "Μέτριο", pieces: 750, material: "Χαρτόνι Premium" },
        { name: "Fractal Forest", difficulty: "Εύκολο", pieces: 400, material: "Ξύλο" }
      ],
      status: "delivered",
      rating: 4
    },
    {
      id: "del_3",
      deliveryDate: new Date("2025-06-01"),
      puzzles: [
        { name: "Welcome Box - Starter Set", difficulty: "Εύκολο", pieces: 300, material: "Χαρτόνι" }
      ],
      status: "delivered",
      rating: 5
    }
  ];

  const subscriptionPlans = [
    {
      id: "monthly",
      name: "Μηνιαία Συνδρομή",
      price: "89.99",
      puzzles: 2,
      savings: 0,
      description: "2 επιλεγμένα fractal puzzles κάθε μήνα",
      features: ["Δωρεάν μεταφορικά", "Προτεραιότητα υποστήριξης", "Αποκλειστικά designs"]
    },
    {
      id: "quarterly",
      name: "Τριμηνιαία Συνδρομή", 
      price: "79.99",
      puzzles: 2,
      savings: 15,
      description: "2 puzzles κάθε μήνα με 15% έκπτωση",
      features: ["Όλα από τη μηνιαία", "Bonus puzzle στο 3ο μήνα", "Πρόωρη πρόσβαση σε νέα designs"]
    },
    {
      id: "annual",
      name: "Ετήσια Συνδρομή",
      price: "69.99", 
      puzzles: 2,
      savings: 25,
      description: "2 puzzles μηνιαίως με 25% έκπτωση",
      features: ["Όλα από την τριμηνιαία", "2 bonus puzzles το χρόνο", "Δωρεάν premium κάδρα", "Αποκλειστικές εκδηλώσεις"]
    }
  ];

  const hasActiveSubscription = mockSubscription?.status === "active";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          PuzzleCraft Subscription
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Λαμβάνετε επιλεγμένα fractal puzzles στην πόρτα σας κάθε μήνα
        </p>
      </div>

      {hasActiveSubscription ? (
        /* Active Subscription Dashboard */
        <div className="space-y-8">
          {/* Current Subscription Status */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white">Ενεργή Συνδρομή</Badge>
                    {subscriptionPlans.find(p => p.id === mockSubscription.planType)?.name}
                  </CardTitle>
                  <CardDescription>
                    {mockSubscription.puzzlesPerDelivery} puzzles κάθε μήνα • €{mockSubscription.monthlyPrice}/μήνα
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Επόμενη παράδοση</div>
                  <div className="text-lg font-semibold">
                    {mockSubscription.nextDelivery.toLocaleDateString('el-GR', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Προτίμηση Δυσκολίας</div>
                  <div className="font-semibold">{mockSubscription.preferredDifficulty === 'mixed' ? 'Μεικτό' : mockSubscription.preferredDifficulty}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Προτίμηση Υλικού</div>
                  <div className="font-semibold">{mockSubscription.preferredMaterial === 'mixed' ? 'Μεικτό' : mockSubscription.preferredMaterial}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ενεργή από</div>
                  <div className="font-semibold">
                    {mockSubscription.startedAt.toLocaleDateString('el-GR')}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="button-manage-subscription">
                      <Settings className="w-4 h-4 mr-2" />
                      Διαχείριση
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Διαχείριση Συνδρομής</DialogTitle>
                      <DialogDescription>
                        Προσαρμόστε τις προτιμήσεις της συνδρομής σας
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Προτιμώμενη Δυσκολία</Label>
                        <Select defaultValue={mockSubscription.preferredDifficulty}>
                          <SelectTrigger data-testid="select-difficulty-preference">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">Μεικτό</SelectItem>
                            <SelectItem value="easy">Εύκολο</SelectItem>
                            <SelectItem value="medium">Μέτριο</SelectItem>
                            <SelectItem value="hard">Δύσκολο</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Προτιμώμενο Υλικό</Label>
                        <Select defaultValue={mockSubscription.preferredMaterial}>
                          <SelectTrigger data-testid="select-material-preference">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">Μεικτό</SelectItem>
                            <SelectItem value="wood">Ξύλο</SelectItem>
                            <SelectItem value="acrylic">Ακρυλικό</SelectItem>
                            <SelectItem value="cardboard">Χαρτόνι</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Ακύρωση</Button>
                        <Button data-testid="button-save-preferences">Αποθήκευση</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" data-testid="button-pause-subscription">
                  <Pause className="w-4 h-4 mr-2" />
                  Παύση
                </Button>

                <Button variant="outline" data-testid="button-skip-delivery">
                  Παράλειψη Επόμενης
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="deliveries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deliveries" data-testid="tab-deliveries">Ιστορικό Παραδόσεων</TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">Επόμενη Παράδοση</TabsTrigger>
            </TabsList>

            {/* Delivery History */}
            <TabsContent value="deliveries" className="space-y-4">
              {mockDeliveries.map((delivery) => (
                <Card key={delivery.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Παράδοση {delivery.deliveryDate.toLocaleDateString('el-GR')}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          Παραδόθηκε
                        </Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`w-4 h-4 ${i < delivery.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {delivery.puzzles.map((puzzle, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded">
                          <Package className="w-6 h-6 text-blue-600" />
                          <div>
                            <div className="font-semibold">{puzzle.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {puzzle.difficulty} • {puzzle.pieces} κομμάτια • {puzzle.material}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Upcoming Delivery */}
            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Επόμενη Παράδοση - {mockSubscription.nextDelivery.toLocaleDateString('el-GR')}
                  </CardTitle>
                  <CardDescription>
                    Τα επιλεγμένα puzzles θα σας σταλούν σύντομα
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Gift className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Είναι έκπληξη! 🎉</h3>
                    <p className="text-muted-foreground mb-4">
                      Τα επιλεγμένα puzzles θα είναι έκπληξη βασισμένα στις προτιμήσεις σας
                    </p>
                    <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Αποστολή σε {Math.ceil((mockSubscription.nextDelivery.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ημέρες
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-muted rounded">
                      <h4 className="font-semibold mb-2">Οι προτιμήσεις σας:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Δυσκολία: {mockSubscription.preferredDifficulty === 'mixed' ? 'Μεικτό' : mockSubscription.preferredDifficulty}</li>
                        <li>• Υλικό: {mockSubscription.preferredMaterial === 'mixed' ? 'Μεικτό' : mockSubscription.preferredMaterial}</li>
                        <li>• Ποσότητα: {mockSubscription.puzzlesPerDelivery} puzzles</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted rounded">
                      <h4 className="font-semibold mb-2">Συμπεριλαμβάνονται:</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Δωρεάν μεταφορικά</li>
                        <li>• Premium συσκευασία</li>
                        <li>• Οδηγίες & tips</li>
                        <li>• Εγγύηση ποιότητας</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        /* Subscription Plans */
        <div className="space-y-8">
          {/* How it Works */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-8">Πώς Λειτουργεί</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Επιλέξτε Πλάνο</h3>
                  <p className="text-sm text-muted-foreground">Διαλέξτε τη συχνότητα και τις προτιμήσεις σας</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Λάβετε Έκπληξη</h3>
                  <p className="text-sm text-muted-foreground">Επιλεγμένα puzzles έρχονται στην πόρτα σας</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Απολαύστε & Μοιραστείτε</h3>
                  <p className="text-sm text-muted-foreground">Λύστε τα puzzles και κοινοποιήστε στην κοινότητα</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">Επιλέξτε το Πλάνο σας</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden ${plan.id === 'quarterly' ? 'ring-2 ring-purple-500 shadow-lg scale-105' : ''}`}
                >
                  {plan.id === 'quarterly' && (
                    <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                      Πιο Δημοφιλές
                    </div>
                  )}
                  
                  <CardHeader className={plan.id === 'quarterly' ? 'pt-12' : ''}>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold">€{plan.price}</div>
                      <div className="text-sm text-muted-foreground">/μήνα</div>
                      {plan.savings > 0 && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          Εξοικονόμηση {plan.savings}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{plan.puzzles} puzzles/μήνα</span>
                      </li>
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full"
                      variant={plan.id === 'quarterly' ? 'default' : 'outline'}
                      data-testid={`subscribe-${plan.id}`}
                    >
                      Επιλογή Πλάνου
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Συχνές Ερωτήσεις</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Μπορώ να ακυρώσω οποτεδήποτε;</h4>
                <p className="text-sm text-muted-foreground">Ναι, μπορείτε να ακυρώσετε ή να παγώσετε τη συνδρομή σας οποτεδήποτε χωρίς επιπλέον χρεώσεις.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Πώς επιλέγονται τα puzzles;</h4>
                <p className="text-sm text-muted-foreground">Η ομάδα μας επιλέγει προσεκτικά τα puzzles βασισμένη στις προτιμήσεις σας και τις νέες κυκλοφορίες.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Υπάρχουν μεταφορικά;</h4>
                <p className="text-sm text-muted-foreground">Όχι! Όλες οι συνδρομές περιλαμβάνουν δωρεάν μεταφορικά σε όλη την Ελλάδα.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Μπορώ να αλλάξω τις προτιμήσεις μου;</h4>
                <p className="text-sm text-muted-foreground">Βεβαίως! Μπορείτε να ενημερώσετε τις προτιμήσεις σας οποτεδήποτε από τον λογαριασμό σας.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}