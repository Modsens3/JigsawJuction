import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  MessageSquare, 
  User,
  HeadphonesIcon,
  Calendar,
  Award,
  Shield
} from "lucide-react";

export default function CustomerService() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Εξυπηρέτηση Πελατών
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Είμαστε εδώ για να σας βοηθήσουμε! Η ομάδα μας είναι έτοιμη να απαντήσει 
            σε κάθε ερώτηση και να λύσει οποιοδήποτε πρόβλημα.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="glass-morphism hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Τηλεφωνική Υποστήριξη</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="space-y-2">
                <p className="font-semibold text-lg">+30 210 123 4567</p>
                <Badge variant="secondary">Δωρεάν κλήση</Badge>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Δευ-Παρ: 9:00-21:00<br />
                Σαβ: 10:00-18:00
              </div>
              <Button className="w-full mt-4">
                <Phone className="w-4 h-4 mr-2" />
                Κλήση Τώρα
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-morphism hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Email Υποστήριξη</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="space-y-2">
                <p className="font-semibold">support@fractalcraft.gr</p>
                <Badge variant="outline">Απάντηση σε 2-4 ώρες</Badge>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 mr-2" />
                24/7 Διαθέσιμο
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Mail className="w-4 h-4 mr-2" />
                Αποστολή Email
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-morphism hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="space-y-2">
                <p className="font-semibold">Άμεση Συνομιλία</p>
                <Badge variant="default">Online τώρα</Badge>
              </div>
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                Μέσος χρόνος απάντησης: 2 λεπτά
              </div>
              <Button variant="secondary" className="w-full mt-4">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ξεκίνησε Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Service Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-6 h-6 mr-3 text-primary" />
                Υψηλή Ποιότητα Εξυπηρέτησης
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold">Εκπαιδευμένο Προσωπικό</h4>
                    <p className="text-sm text-muted-foreground">
                      Ειδικοί στην τεχνολογία fractal και την παραγωγή παζλ
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold">Γρήγορη Απάντηση</h4>
                    <p className="text-sm text-muted-foreground">
                      Απαντάμε άμεσα σε όλες τις επικοινωνίες
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold">Προσωπική Φροντίδα</h4>
                    <p className="text-sm text-muted-foreground">
                      Κάθε πελάτης είναι μοναδικός για εμάς
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 mr-3 text-secondary" />
                Εγγυήσεις & Πολιτικές
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold">30 Ημέρες Εγγύηση</h4>
                    <p className="text-sm text-muted-foreground">
                      Πλήρης εγγύηση ικανοποίησης σε όλα τα προϊόντα
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold">Δωρεάν Αντικατάσταση</h4>
                    <p className="text-sm text-muted-foreground">
                      Αντικαθιστούμε χωρίς χρέωση ελαττωματικά προϊόντα
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold">Ασφάλεια Πληρωμών</h4>
                    <p className="text-sm text-muted-foreground">
                      Κρυπτογραφημένες και ασφαλείς συναλλαγές
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Office Information */}
        <Card className="glass-morphism mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-accent" />
              Τα Γραφεία Μας
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Κεντρικά Γραφεία - Αθήνα</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Λεωφόρος Κηφισίας 123, 15124 Μαρούσι
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Δευτέρα - Παρασκευή: 9:00 - 18:00
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    +30 210 123 4567
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Παραγωγή - Θεσσαλονίκη</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Βιομηχανική Περιοχή Σίνδου, 57022
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Δευτέρα - Παρασκευή: 8:00 - 16:00
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    +30 2310 987 654
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="glass-morphism bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <HeadphonesIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Επείγουσα Υποστήριξη</h3>
                  <p className="text-muted-foreground">
                    Για επείγοντα προβλήματα με παραγγελίες σε εξέλιξη
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">+30 6900 123 456</p>
                <Badge variant="destructive">24/7 Διαθέσιμο</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}