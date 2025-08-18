import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  RotateCcw,
  Package,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Truck,
  CreditCard,
  Mail,
  Phone
} from "lucide-react";

export default function Returns() {
  const [returnReason, setReturnReason] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [description, setDescription] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const returnReasons = [
    { id: "defective", label: "Ελαττωματικό προϊόν", description: "Το παζλ έφτασε σπασμένο ή με ελαττώματα" },
    { id: "wrong-item", label: "Λάθος προϊόν", description: "Λάβατε διαφορετικό προϊόν από αυτό που παραγγείλατε" },
    { id: "not-as-described", label: "Όχι όπως περιγράφηκε", description: "Το προϊόν δεν ταιριάζει με την περιγραφή" },
    { id: "changed-mind", label: "Άλλαξα γνώμη", description: "Δεν θέλω πια το προϊόν" },
    { id: "quality-issues", label: "Πρόβλημα ποιότητας", description: "Η ποιότητα δεν είναι η αναμενόμενη" },
    { id: "other", label: "Άλλος λόγος", description: "Παρακαλώ περιγράψτε τον λόγο παρακάτω" }
  ];

  const handleSubmitReturn = () => {
    // In real app, this would submit to API
    alert("Η αίτηση επιστροφής σας καταχωρήθηκε! Θα λάβετε email με οδηγίες.");
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Επιστροφές & Ανταλλαγές
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            30 ημέρες πλήρης εγγύηση ικανοποίησης. Κάνουμε εύκολες τις επιστροφές!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Return Policy */}
          <div className="lg:col-span-2 space-y-6">
            {/* Policy Overview */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-primary" />
                  Πολιτική Επιστροφών
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Clock className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">30 Ημέρες</h4>
                    <p className="text-sm text-muted-foreground">Χρονικό όριο για επιστροφές</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Package className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Δωρεάν Επιστροφή</h4>
                    <p className="text-sm text-muted-foreground">Για ελαττωματικά προϊόντα</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <CreditCard className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Πλήρης Επιστροφή</h4>
                    <p className="text-sm text-muted-foreground">100% των χρημάτων</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Τι Μπορείτε να Επιστρέψετε:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
        
                        <p className="text-sm text-muted-foreground">Προ-σχεδιασμένα παζλ σε άριστη κατάσταση</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Ελαττωματικά Προϊόντα</p>
                        <p className="text-sm text-muted-foreground">Οποιοδήποτε προϊόν με βλάβη ή ελάττωμα</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Custom Παζλ (περιορισμένα)</p>
                        <p className="text-sm text-muted-foreground">Μόνο αν υπάρχει ελάττωμα παραγωγής</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Μη Επιστρέψιμα</p>
                        <p className="text-sm text-muted-foreground">Προσωπικά παζλ χωρίς ελάττωμα</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Return Form */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RotateCcw className="w-6 h-6 mr-3 text-secondary" />
                  Αίτηση Επιστροφής
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-code">Κωδικός Παραγγελίας *</Label>
                    <Input
                      id="order-code"
                      placeholder="π.χ. FC2025001234"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Επικοινωνίας *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="το email της παραγγελίας"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Λόγος Επιστροφής *</Label>
                  <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                    {returnReasons.map((reason) => (
                      <div key={reason.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors">
                        <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                        <div className="flex-grow">
                          <Label htmlFor={reason.id} className="font-medium cursor-pointer">
                            {reason.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reason.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Περιγραφή (Προαιρετική)</Label>
                  <Textarea
                    id="description"
                    placeholder="Περιγράψτε το πρόβλημα ή τον λόγο επιστροφής..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <div className="flex items-start space-x-3">
                      <Camera className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <h5 className="font-medium mb-2">Φωτογραφίες (Συνιστάται)</h5>
                        <p className="text-sm text-muted-foreground mb-3">
                          Για γρηγορότερη επεξεργασία, παρακαλούμε ανεβάστε φωτογραφίες του προβλήματος
                        </p>
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Ανέβασμα Φωτογραφιών
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Συμφωνώ με τους <a href="#" className="text-primary underline">όρους επιστροφής</a> και 
                    επιβεβαιώνω ότι οι πληροφορίες είναι ακριβείς
                  </Label>
                </div>

                <Button 
                  onClick={handleSubmitReturn}
                  disabled={!orderCode || !returnReason || !agreedToTerms}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Υποβολή Αίτησης Επιστροφής
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Process Steps */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-lg">Διαδικασία Επιστροφής</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h5 className="font-medium">Υποβολή Αίτησης</h5>
                      <p className="text-sm text-muted-foreground">Συμπληρώστε τη φόρμα επιστροφής</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h5 className="font-medium">Έγκριση</h5>
                      <p className="text-sm text-muted-foreground">Επεξεργασία σε 1-2 ημέρες</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h5 className="font-medium">Αποστολή</h5>
                      <p className="text-sm text-muted-foreground">Ετικέτα δωρεάν επιστροφής</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h5 className="font-medium">Επιστροφή</h5>
                      <p className="text-sm text-muted-foreground">Χρήματα σε 5-10 ημέρες</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-morphism bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Γρήγορα Στοιχεία</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Μέσος χρόνος επεξεργασίας:</span>
                    <Badge variant="secondary">24 ώρες</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ποσοστό έγκρισης:</span>
                    <Badge variant="secondary">98%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ικανοποίηση πελατών:</span>
                    <Badge variant="secondary">4.9/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="text-lg">Χρειάζεστε Βοήθεια;</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Επικοινωνήστε με την ομάδα υποστήριξης για οποιαδήποτε ερώτηση
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    +30 210 123 4567
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    returns@fractalcraft.gr
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="glass-morphism">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <h5 className="font-medium mb-2">Συχνές Ερωτήσεις</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Δείτε απαντήσεις σε συχνές ερωτήσεις
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Δείτε FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Info */}
        <Card className="glass-morphism mt-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-primary" />
                  Διεύθυνση Επιστροφής
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>FractalCraft Returns</strong></p>
                  <p>Βιομηχανική Περιοχή Σίνδου</p>
                  <p>57022 Θεσσαλονίκη</p>
                  <p className="text-muted-foreground mt-2">
                    <strong>Σημαντικό:</strong> Μη στέλνετε πακέτα χωρίς πρότερη έγκριση
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-secondary" />
                  Εγγύηση Ικανοποίησης
                </h3>
                <div className="space-y-2 text-sm">
                  <p>✓ 30 ημέρες πλήρης εγγύηση</p>
                  <p>✓ Δωρεάν επιστροφή για ελαττώματα</p>
                  <p>✓ Άμεση αντικατάσταση</p>
                  <p>✓ 100% επιστροφή χρημάτων</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}