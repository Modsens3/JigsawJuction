import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown,
  Search,
  HelpCircle,
  Package,
  CreditCard,
  Truck,
  Settings,
  Zap,
  Shield
} from "lucide-react";

const faqCategories = [
  {
    icon: Package,
    title: "Προϊόντα & Παραγγελίες",
    color: "from-primary to-secondary",
    questions: [
      {
        question: "Τι είναι τα fractal παζλ;",
        answer: "Τα fractal παζλ είναι μοναδικά παζλ που δημιουργούνται με μαθηματικούς αλγόριθμους fractal. Κάθε κομμάτι έχει ένα μοναδικό, γεωμετρικό σχήμα που δημιουργείται αυτόματα, παράγοντας απείρως πολύπλοκα και όμορφα σχέδια που δεν μπορούν να αναπαραχθούν με παραδοσιακές μεθόδους."
      },
      {
        question: "Πόσο καιρό χρειάζεται για να φτιαχτεί ένα παζλ;",
        answer: "Η παραγωγή των fractal παζλ διαρκεί 3-7 εργάσιμες ημέρες ανάλογα με το υλικό και το μέγεθος. Τα παζλ σε χαρτί είναι έτοιμα σε 3-4 ημέρες, ενώ τα ξύλινα και ακρυλικά χρειάζονται 5-7 ημέρες λόγω της ειδικής επεξεργασίας."
      },
      {
        question: "Μπορώ να διαλέξω τον αριθμό των κομματιών;",
        answer: "Όχι, ο αριθμός των κομματιών καθορίζεται αυτόματα από τον fractal αλγόριθμο βάσει της δυσκολίας που επιλέγετε. Αυτό εξασφαλίζει ότι κάθε κομμάτι έχει το σωστό μέγεθος και πολυπλοκότητα για τη βέλτιστη εμπειρία παιχνιδιού."
      },
      {
        question: "Ποια είναι τα διαθέσιμα μεγέθη;",
        answer: "Προσφέρουμε 5 μεγέθη: Μικρό (20x15cm), Μεσαίο (30x22cm), Μεγάλο (40x30cm), Extra Μεγάλο (50x37cm), και Jumbo (60x45cm). Κάθε μέγεθος έχει διαφορετική τιμή και χρόνο παραγωγής."
      }
    ]
  },
  {
    icon: Zap,
    title: "Γεννήτρια Fractal",
    color: "from-secondary to-accent",
    questions: [
      {
        question: "Πώς λειτουργεί η γεννήτρια fractal;",
        answer: "Η γεννήτρια μας χρησιμοποιεί προηγμένους αλγόριθμους για να δημιουργήσει μοναδικά σχήματα κομματιών. Ανεβάζετε την εικόνα σας, επιλέγετε σχήμα, μέγεθος, seed και δυσκολία, και ο αλγόριθμος δημιουργεί αυτόματα τα fractal κομμάτια που ταιριάζουν τέλεια μεταξύ τους."
      },
      {
        question: "Τι σημαίνει το 'seed' στη γεννήτρια;",
        answer: "Το seed είναι ένας αριθμός που καθορίζει τη μοναδικότητα του σχεδίου. Ο ίδιος seed με τις ίδιες ρυθμίσεις θα δώσει πάντα το ίδιο αποτέλεσμα. Αλλάζοντας το seed, παίρνετε εντελώς διαφορετικά σχέδια fractal."
      },
      {
        question: "Ποιες είναι οι διαφορές στη δυσκολία;",
        answer: "Η δυσκολία καθορίζει το μέγεθος των κομματιών: Πολύ Εύκολο (μεγάλα κομμάτια), Εύκολο, Κανονικό, Δύσκολο, και Πολύ Δύσκολο (πολύ μικρά κομμάτια). Μεγαλύτερη δυσκολία σημαίνει περισσότερα και μικρότερα κομμάτια."
      },
      {
        question: "Μπορώ να προεπισκοπήσω το παζλ πριν το παραγγείλω;",
        answer: "Ναι! Μετά τη δημιουργία, βλέπετε μια πλήρη προεπισκόπηση με τα πραγματικά κοψίματα του παζλ. Μπορείτε να δείτε ακριβώς πώς θα μοιάζει το τελικό προϊόν και να κάνετε αλλαγές αν χρειαστεί."
      }
    ]
  },
  {
    icon: CreditCard,
    title: "Πληρωμές & Τιμές",
    color: "from-accent to-primary",
    questions: [
      {
        question: "Ποιοι τρόποι πληρωμής δέχονται;",
        answer: "Δεχόμαστε όλες τις κύριες πιστωτικές κάρτες (Visa, Mastercard, American Express), PayPal, τραπεζικό έμβασμα, και πληρωμή με αντικαταβολή για παραγγελίες εντός Ελλάδας."
      },
      {
        question: "Πώς υπολογίζεται η τιμή;",
        answer: "Η τιμή εξαρτάται από το υλικό (χαρτί €15-35, ξύλο €25-65, ακρυλικό €35-85) και το μέγεθος. Ο αριθμός των κομματιών δεν επηρεάζει την τιμή καθώς καθορίζεται αυτόματα από τον αλγόριθμο."
      },
      {
        question: "Υπάρχουν εκπτώσεις για πολλαπλές παραγγελίες;",
        answer: "Ναι! Για 3+ παζλ: 10% έκπτωση, για 5+ παζλ: 15% έκπτωση, για 10+ παζλ: 20% έκπτωση. Οι εκπτώσεις εφαρμόζονται αυτόματα στο καλάθι."
      },
      {
        question: "Πότε χρεώνεται η κάρτα μου;",
        answer: "Η χρέωση γίνεται κατά την επιβεβαίωση της παραγγελίας. Για custom παραγγελίες, χρεώνουμε 50% προκαταβολή και το υπόλοιπο πριν την αποστολή."
      }
    ]
  },
  {
    icon: Truck,
    title: "Αποστολές",
    color: "from-primary to-accent",
    questions: [
      {
        question: "Πόσο κοστίζει η αποστολή;",
        answer: "Αποστολή εντός Ελλάδας: €4.90 (δωρεάν για παραγγελίες άνω των €50). Κύπρος: €12. Ευρώπη: €15-25. Υπεύθυνη αποστολή με ασφάλιση: +€3."
      },
      {
        question: "Σε πόσο καιρό φτάνει η παραγγελία μου;",
        answer: "Εντός Ελλάδας: 1-2 εργάσιμες ημέρες. Κύπρος: 3-5 ημέρες. Ευρώπη: 5-10 ημέρες. Ο χρόνος παραγωγής (3-7 ημέρες) προστίθεται στον χρόνο αποστολής."
      },
      {
        question: "Μπορώ να παρακολουθήσω την παραγγελία μου;",
        answer: "Ναι! Λαμβάνετε tracking number μόλις σταλεί η παραγγελία. Μπορείτε να την παρακολουθείτε στη σελίδα 'Παρακολούθηση Παραγγελίας' με τον κωδικό σας."
      },
      {
        question: "Στέλνετε στο εξωτερικό;",
        answer: "Στέλνουμε σε όλη την Ευρώπη και επιλεγμένες χώρες παγκοσμίως. Οι χρόνοι και κόστη αποστολής διαφέρουν ανά προορισμό. Επικοινωνήστε μαζί μας για συγκεκριμένους προορισμούς."
      }
    ]
  },
  {
    icon: Shield,
    title: "Επιστροφές & Εγγυήσεις",
    color: "from-secondary to-primary",
    questions: [
      {
        question: "Ποια είναι η πολιτική επιστροφών;",
        answer: "30 ημέρες πλήρης εγγύηση ικανοποίησης. Αν δεν είστε ευχαριστημένοι, επιστρέφουμε πλήρως τα χρήματά σας. Τα custom παζλ από προσωπικές φωτογραφίες δεν επιστρέφονται εκτός αν υπάρχει ελάττωμα."
      },
      {
        question: "Τι γίνεται αν το παζλ φτάσει σπασμένο;",
        answer: "Αντικαθιστούμε άμεσα χωρίς επιπλέον χρέωση οποιοδήποτε προϊόν φτάσει ελαττωματικό ή σπασμένο. Αρκεί να μας στείλετε φωτογραφίες εντός 48 ωρών από την παραλαβή."
      },
      {
        question: "Πώς κάνω επιστροφή;",
        answer: "Επικοινωνήστε μαζί μας στο support@fractalcraft.gr ή τηλεφωνικά. Θα σας στείλουμε prepaid ετικέτα επιστροφής. Τα χρήματα επιστρέφονται εντός 5-10 εργασίμων ημερών μετά την παραλαβή."
      },
      {
        question: "Υπάρχει εγγύηση ποιότητας;",
        answer: "Ναι! Όλα τα προϊόντα μας έχουν εγγύηση ποιότητας. Χρησιμοποιούμε premium υλικά και προηγμένη τεχνολογία κοπής laser για τέλεια αποτελέσματα."
      }
    ]
  },
  {
    icon: Settings,
    title: "Τεχνικές Ερωτήσεις",
    color: "from-accent to-secondary",
    questions: [
      {
        question: "Τι ανάλυση πρέπει να έχει η φωτογραφία μου;",
        answer: "Συνιστούμε τουλάχιστον 1200x900 pixels για καλή ποιότητα. Για καλύτερα αποτελέσματα: 2400x1800+ pixels. Αποδεκτές μορφές: JPG, PNG, PDF έως 10MB."
      },
      {
        question: "Μπορώ να χρησιμοποιήσω οποιαδήποτε φωτογραφία;",
        answer: "Ναι, αλλά οι καθαρές, υψηλής αντίθεσης φωτογραφίες δίνουν καλύτερα αποτελέσματα. Αποφύγετε θολές ή πολύ σκοτεινές εικόνες. Η ομάδα μας μπορεί να σας συμβουλεύσει για βελτιστοποίηση."
      },
      {
        question: "Τι είναι τα σχήματα στη γεννήτρια;",
        answer: "Διαφορετικά fractal patterns: Κλασικό (παραδοσιακά σχήματα), Οργανικό (φυσικές καμπύλες), Γεωμετρικό (αιχμηρές γωνίες), Στρογγυλό (μαλακές καμπύλες). Κάθε σχήμα δίνει διαφορετική αισθητική στο παζλ."
      },
      {
        question: "Μπορώ να αποθηκεύσω το σχέδιό μου;",
        answer: "Ναι! Μπορείτε να κατεβάσετε το fractal design ως εικόνα υψηλής ανάλυσης ή να το αποθηκεύσετε στο προφίλ σας για μελλοντική χρήση ή τροποποίηση."
      }
    ]
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openSections, setOpenSections] = useState<string[]>(["Προϊόντα & Παραγγελίες"]);

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleSection = (title: string) => {
    setOpenSections(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Συχνές Ερωτήσεις
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Βρείτε γρήγορα απαντήσεις στις πιο συχνές ερωτήσεις για τα fractal παζλ
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Αναζητήστε ερωτήσεις..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            const isOpen = openSections.includes(category.title);
            
            return (
              <Card key={category.title} className="glass-morphism overflow-hidden">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleSection(category.title)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <span>{category.title}</span>
                          <Badge variant="secondary" className="ml-3">
                            {category.questions.length} ερωτήσεις
                          </Badge>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {category.questions.map((item, index) => (
                          <Card key={index} className="border border-border/50 hover:border-primary/20 transition-colors">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold flex items-start">
                                  <HelpCircle className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                  {item.question}
                                </h4>
                                <p className="text-muted-foreground leading-relaxed ml-7">
                                  {item.answer}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {filteredCategories.length === 0 && searchTerm && (
          <Card className="glass-morphism text-center p-12">
            <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Δεν βρέθηκαν αποτελέσματα</h3>
            <p className="text-muted-foreground mb-6">
              Δε βρήκαμε ερωτήσεις που να ταιριάζουν με την αναζήτησή σας.
            </p>
            <Button onClick={() => setSearchTerm("")}>
              Καθαρισμός αναζήτησης
            </Button>
          </Card>
        )}

        {/* Contact CTA */}
        <Card className="glass-morphism mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">
              Δεν βρήκατε την απάντηση που ψάχνατε;
            </h3>
            <p className="text-muted-foreground mb-6">
              Η ομάδα εξυπηρέτησης πελατών μας είναι εδώ για να σας βοηθήσει!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Επικοινωνία με Υποστήριξη
              </Button>
              <Button variant="outline" size="lg">
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}