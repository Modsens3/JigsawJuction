import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Database, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Πολιτική Απορρήτου</h1>
          <p className="text-lg text-gray-600">Τελευταία ενημέρωση: 18 Αυγούστου 2025</p>
          <Badge variant="outline" className="mt-2">
            <Shield className="w-4 h-4 mr-2" />
            GDPR Compliant
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              1. Εισαγωγή
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Η PuzzleCraft ("εμείς", "μας", "η εταιρεία μας") σέβεται την ιδιωτικότητά σας και δεσμεύεται να προστατεύει τα προσωπικά σας δεδομένα. 
              Αυτή η Πολιτική Απορρήτου εξηγεί πώς συλλέγουμε, χρησιμοποιούμε, αποθηκεύουμε και προστατεύουμε τα προσωπικά σας δεδομένα 
              σύμφωνα με τον Γενικό Κανονισμό Προστασίας Δεδομένων (GDPR) και την ελληνική νομοθεσία.
            </p>
            <p>
              <strong>Υπεύθυνος Επεξεργασίας:</strong> PuzzleCraft, Αθήνα, Ελλάδα<br/>
              <strong>Email:</strong> privacy@puzzlecraft.gr<br/>
              <strong>Τηλέφωνο:</strong> +30 210 123 4567
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              2. Προσωπικά Δεδομένα που Συλλέγουμε
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Δεδομένα Ταυτοποίησης
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Όνομα και επώνυμο</li>
                  <li>• Διεύθυνση email</li>
                  <li>• Αριθμός τηλεφώνου</li>
                  <li>• Ημερομηνία γέννησης (προαιρετικά)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Δεδομένα Διεύθυνσης
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Διεύθυνση αποστολής</li>
                  <li>• Πόλη και ΤΚ</li>
                  <li>• Χώρα</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center">
                <Lock className="w-4 h-4 mr-2" />
                Τεχνικά Δεδομένα
              </h4>
              <ul className="text-sm space-y-1">
                <li>• IP διεύθυνση</li>
                <li>• Cookies και παρόμοιες τεχνολογίες</li>
                <li>• Στοιχεία περιήγησης</li>
                <li>• Στοιχεία συσκευής</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Σκοπός Επεξεργασίας</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Κύριοι Σκοποί:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Εκτέλεση παραγγελιών</li>
                  <li>• Παροχή εξυπηρέτησης πελατών</li>
                  <li>• Επεξεργασία πληρωμών</li>
                  <li>• Αποστολή ενημερωτικών email</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Νομική Βάση:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Εκτέλεση συμβολαίου</li>
                  <li>• Νόμιμο συμφέρον</li>
                  <li>• Συγκατάθεση (όπου ισχύει)</li>
                  <li>• Νομική υποχρέωση</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Δικαιώματα σας (GDPR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Δικαιώματα Πρόσβασης:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Δικαίωμα πρόσβασης στα δεδομένα σας</li>
                  <li>• Δικαίωμα διόρθωσης</li>
                  <li>• Δικαίωμα διαγραφής ("δικαίωμα λήθης")</li>
                  <li>• Δικαίωμα περιορισμού επεξεργασίας</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Δικαιώματα Ελέγχου:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Δικαίωμα φορητότητας δεδομένων</li>
                  <li>• Δικαίωμα αντιρρήσεως</li>
                  <li>• Δικαίωμα ανάκλησης συγκατάθεσης</li>
                  <li>• Δικαίωμα καταγγελίας</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <strong>Για να ασκήσετε τα δικαιώματά σας:</strong><br/>
                Email: privacy@puzzlecraft.gr<br/>
                Τηλέφωνο: +30 210 123 4567<br/>
                Διεύθυνση: Αθήνα, Ελλάδα
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Αποθήκευση και Ασφάλεια</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Περίοδος Αποθήκευσης:</h4>
              <ul className="text-sm space-y-1">
                <li>• Δεδομένα λογαριασμού: Μέχρι τη διαγραφή του λογαριασμού</li>
                <li>• Δεδομένα παραγγελιών: 10 χρόνια (νομική υποχρέωση)</li>
                <li>• Cookies: Μέχρι 2 χρόνια</li>
                <li>• Marketing emails: Μέχρι την ανάκληση συγκατάθεσης</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Μέτρα Ασφάλειας:</h4>
              <ul className="text-sm space-y-1">
                <li>• Κρυπτογράφηση SSL/TLS</li>
                <li>• Ασφαλείς βάσεις δεδομένων</li>
                <li>• Κανονική ενημέρωση συστημάτων</li>
                <li>• Πρόσβαση μόνο για εξουσιοδοτημένο προσωπικό</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Cookies και Παρόμοιες Τεχνολογίες</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Απαραίτητα Cookies:</h4>
                <p className="text-sm">Για τη λειτουργία της ιστοσελίδας (session, authentication)</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Αναλυτικά Cookies:</h4>
                <p className="text-sm">Για την ανάλυση επισκεπτών και βελτίωση της εμπειρίας</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Marketing Cookies:</h4>
                <p className="text-sm">Για προσωποποιημένη διαφήμιση (με συγκατάθεση)</p>
              </div>
            </div>
            <p className="text-sm">
              Μπορείτε να διαχειριστείτε τις προτιμήσεις cookies σας στις ρυθμίσεις του browser σας.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Διαμοιρασμός Δεδομένων</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Δεν πωλούμε, ενοικιάζουμε ή διαμοιράζουμε τα προσωπικά σας δεδομένα σε τρίτους, 
              εκτός από τις εξής περιπτώσεις:
            </p>
            <ul className="text-sm space-y-2">
              <li>• <strong>Πάροχοι πληρωμών:</strong> Για την επεξεργασία πληρωμών</li>
              <li>• <strong>Υπηρεσίες αποστολής:</strong> Για την παράδοση παραγγελιών</li>
              <li>• <strong>Νομική υποχρέωση:</strong> Όταν απαιτείται από νόμο</li>
              <li>• <strong>Συγκατάθεση:</strong> Όταν έχετε δώσει ρητή συγκατάθεση</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Επικοινωνία και Ερωτήσεις</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Για οποιαδήποτε ερώτηση σχετικά με αυτή την Πολιτική Απορρήτου ή τα προσωπικά σας δεδομένα:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Επικοινωνία:</h4>
                  <p className="text-sm">
                    <Mail className="w-4 h-4 inline mr-2" />
                    privacy@puzzlecraft.gr<br/>
                    <Phone className="w-4 h-4 inline mr-2" />
                    +30 210 123 4567<br/>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Αθήνα, Ελλάδα
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Απόκριση:</h4>
                  <p className="text-sm">
                    Θα απαντήσουμε εντός 30 ημερών από την υποβολή του αιτήματός σας.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Αλλαγές στην Πολιτική</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Δεσμευόμαστε να ενημερώνουμε αυτή την Πολιτική Απορρήτου όταν αλλάζουμε τις πρακτικές μας. 
              Οι αλλαγές θα δημοσιεύονται σε αυτή τη σελίδα με ενημερωμένη ημερομηνία.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Αυτή η Πολιτική Απορρήτου είναι συμβατή με τον GDPR (EU 2016/679) και την ελληνική νομοθεσία.
          </p>
        </div>
      </div>
    </div>
  );
}