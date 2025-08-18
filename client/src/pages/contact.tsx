import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  Building,
  Users,
  Award,
  Globe,
  Calendar,
  HeadphonesIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Μήνυμα εστάλη!",
      description: "Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Επικοινωνία
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Είμαστε εδώ για να σας βοηθήσουμε! Επικοινωνήστε μαζί μας για οποιαδήποτε ερώτηση 
            σχετικά με τα fractal παζλ μας.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-6">
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-6 h-6 mr-3 text-primary" />
                  Στείλτε μας Μήνυμα
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ονοματεπώνυμο *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Θέμα *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Σύντομη περιγραφή του θέματος"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Μήνυμα *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Περιγράψτε λεπτομερώς την ερώτησή σας..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    size="lg"
                  >
                    {isSubmitting ? (
                      "Αποστολή..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Αποστολή Μηνύματος
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="glass-morphism bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeadphonesIcon className="w-6 h-6 mr-3 text-primary" />
                  Γρήγορη Επικοινωνία
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-6 h-6 text-primary" />
                      <div className="text-left">
                        <p className="font-semibold">Τηλεφωνικά</p>
                        <p className="text-sm text-muted-foreground">+30 210 123 4567</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Δευ-Παρ 9:00-21:00
                        </Badge>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto p-4 justify-start">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-6 h-6 text-secondary" />
                      <div className="text-left">
                        <p className="font-semibold">Live Chat</p>
                        <p className="text-sm text-muted-foreground">Άμεση βοήθεια</p>
                        <Badge variant="default" className="mt-1 text-xs">
                          Online τώρα
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Office Locations */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-6 h-6 mr-3 text-secondary" />
                  Γραφεία & Εγκαταστάσεις
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Athens Office */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Κεντρικά Γραφεία - Αθήνα</h3>
                    <Badge variant="default">Κεντρικό</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      Λεωφόρος Κηφισίας 123, 15124 Μαρούσι
                    </p>
                    <p className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      +30 210 123 4567
                    </p>
                    <p className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      athens@fractalcraft.gr
                    </p>
                    <p className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Δευτέρα - Παρασκευή: 9:00 - 18:00
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Thessaloniki Production */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Παραγωγή - Θεσσαλονίκη</h3>
                    <Badge variant="outline">Παραγωγή</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      Βιομηχανική Περιοχή Σίνδου, 57022
                    </p>
                    <p className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      +30 2310 987 654
                    </p>
                    <p className="flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4 mr-2" />
                      production@fractalcraft.gr
                    </p>
                    <p className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      Δευτέρα - Παρασκευή: 8:00 - 16:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-3 text-accent" />
                  Η Εταιρεία Μας
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Calendar className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">2019</p>
                    <p className="text-sm text-muted-foreground">Έτος Ίδρυσης</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Users className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">25+</p>
                    <p className="text-sm text-muted-foreground">Εργαζόμενοι</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Globe className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">15</p>
                    <p className="text-sm text-muted-foreground">Χώρες</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Award className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-semibold">50K+</p>
                    <p className="text-sm text-muted-foreground">Ευχαριστημένοι Πελάτες</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Η Ιστορία Μας</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Από το 2019, η FractalCraft επαναστατεί στον κόσμο των παζλ με την τεχνολογία fractal. 
                    Συνδυάζουμε μαθηματική ακρίβεια με καλλιτεχνική δημιουργικότητα για να φτιάχνουμε 
                    μοναδικά προϊόντα που εμπνέουν και διασκεδάζουν.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-primary" />
                  Ωράριο Υποστήριξης
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Δευτέρα - Παρασκευή</span>
                    <Badge variant="secondary">9:00 - 21:00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Σάββατο</span>
                    <Badge variant="secondary">10:00 - 18:00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Κυριακή</span>
                    <Badge variant="outline">Κλειστά</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Επείγουσα Υποστήριξη</span>
                    <Badge variant="destructive">24/7</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Για επείγοντα θέματα: +30 6900 123 456
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="glass-morphism mt-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-secondary" />
              Βρείτε μας
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-3">
                <MapPin className="w-16 h-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Χάρτης Τοποθεσίας</h3>
                <p className="text-muted-foreground max-w-md">
                  Επισκεφτείτε τα γραφεία μας στη Μαρούσι για προσωπική εξυπηρέτηση 
                  και να δείτε από κοντά τα fractal παζλ μας
                </p>
                <Button className="mt-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  Άνοιγμα στο Google Maps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}