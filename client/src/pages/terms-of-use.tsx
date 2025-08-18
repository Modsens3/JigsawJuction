import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, AlertTriangle, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Όροι Χρήσης</h1>
          <p className="text-lg text-gray-600">Τελευταία ενημέρωση: 18 Αυγούστου 2025</p>
          <Badge variant="outline" className="mt-2">
            <Shield className="w-4 h-4 mr-2" />
            EU Consumer Protection Compliant
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              1. Γενικές Διατάξεις
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Καλώς ήρθατε στην PuzzleCraft ("εμείς", "μας", "η εταιρεία μας"). Αυτοί οι Όροι Χρήσης διέπουν τη χρήση 
              της ιστοσελίδας μας και των υπηρεσιών μας. Με την πρόσβαση και τη χρήση της ιστοσελίδας μας, 
              συμφωνείτε να συμμορφώνεστε με αυτούς τους όρους.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Εταιρικά Στοιχεία:</h4>
                <p className="text-sm">
                  <strong>PuzzleCraft</strong><br/>
                  Αθήνα, Ελλάδα<br/>
                  ΑΦΜ: 123456789<br/>
                  ΔΟΥ: Α' Αθηνών
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Επικοινωνία:</h4>
                <p className="text-sm">
                  <Mail className="w-4 h-4 inline mr-2" />
                  info@puzzlecraft.gr<br/>
                  <Phone className="w-4 h-4 inline mr-2" />
                  +30 210 123 4567<br/>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Αθήνα, Ελλάδα
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Υπηρεσίες και Προϊόντα</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Η PuzzleCraft παρέχει υπηρεσίες δημιουργίας και πώλησης προσαρμοσμένων fractal puzzles. 
              Τα προϊόντα μας περιλαμβάνουν:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Υπηρεσίες:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Δημιουργία προσαρμοσμένων puzzles</li>
                  <li>• Laser cutting υπηρεσίες</li>
                  <li>• Online configurator</li>
                  <li>• Εξυπηρέτηση πελατών</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Προϊόντα:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Fractal puzzles σε ξύλο</li>
                  <li>• Προσαρμοσμένα σχέδια</li>
                  <li>• Διάφορα μεγέθη και υλικά</li>
                  <li>• Συνοδευτικά υλικά</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Δημιουργία Λογαριασμού</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Για να χρησιμοποιήσετε ορισμένες υπηρεσίες μας, πρέπει να δημιουργήσετε λογαριασμό. 
              Συμφωνείτε να:
            </p>
            <ul className="text-sm space-y-2">
              <li>• Παρέχετε ακριβείς και ενημερωμένες πληροφορίες</li>
              <li>• Προστατεύετε τα στοιχεία σύνδεσής σας</li>
              <li>• Ενημερώνετε άμεσα για οποιαδήποτε αλλαγή</li>
              <li>• Είστε υπεύθυνοι για όλες τις δραστηριότητες στον λογαριασμό σας</li>
            </ul>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2 text-yellow-600" />
                <strong>Προσοχή:</strong> Η εταιρεία μας δεν είναι υπεύθυνη για μη εξουσιοδοτημένη χρήση του λογαριασμού σας.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Παραγγελίες και Πληρωμές</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Διαδικασία Παραγγελίας:</h4>
                <ol className="text-sm space-y-1">
                  <li>1. Επιλογή προϊόντος και customization</li>
                  <li>2. Προσθήκη στο καλάθι</li>
                  <li>3. Συμπλήρωση στοιχείων</li>
                  <li>4. Επιβεβαίωση παραγγελίας</li>
                  <li>5. Πληρωμή</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Μέθοδοι Πληρωμής:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Πιστωτικές/Χρεωστικές κάρτες</li>
                  <li>• PayPal</li>
                  <li>• Τραπεζική μεταφορά</li>
                  <li>• Αντικαταβολή (επιπλέον χρέωση)</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <CheckCircle className="w-4 h-4 inline mr-2 text-blue-600" />
                <strong>Ασφάλεια:</strong> Όλες οι πληρωμές επεξεργάζονται μέσω ασφαλών παρόχων με κρυπτογράφηση SSL.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Τιμές και Φόροι</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Τιμολόγηση:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Όλες οι τιμές είναι σε EUR</li>
                  <li>• Περιλαμβάνουν ΦΠΑ 24%</li>
                  <li>• Επιπλέον κόστη αποστολής</li>
                  <li>• Τιμές μπορεί να αλλάξουν</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Κόστη Αποστολής:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Ελλάδα: 5€ - 15€</li>
                  <li>• Ευρώπη: 15€ - 25€</li>
                  <li>• Διεθνώς: 25€ - 45€</li>
                  <li>• Δωρεάν για παραγγελίες &gt;100€</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Παράδοση και Χρόνοι</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Χρόνοι Παραγωγής:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Standard: 5-7 εργάσιμες ημέρες</li>
                  <li>• Express: 2-3 εργάσιμες ημέρες</li>
                  <li>• Custom designs: 7-10 ημέρες</li>
                  <li>• Bulk orders: 10-15 ημέρες</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Μέθοδοι Παράδοσης:</h4>
                <ul className="text-sm space-y-1">
                  <li>• ACS Courier</li>
                  <li>• ΕΛΤΑ Courier</li>
                  <li>• DHL Express</li>
                  <li>• Pickup από κατάστημα</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm">
                <Clock className="w-4 h-4 inline mr-2 text-green-600" />
                <strong>Ενημέρωση:</strong> Θα λάβετε email με tracking number μόλις αποσταλεί η παραγγελία σας.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Δικαιώματα Καταναλωτή (ΕΕ)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Δικαίωμα Απόσυρσης:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 14 ημέρες από την παραλαβή</li>
                  <li>• Χωρίς αιτιολόγηση</li>
                  <li>• Πλήρης επιστροφή ποσού</li>
                  <li>• Εξαιρέσεις για προσαρμοσμένα προϊόντα</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Εγγύηση:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 2 χρόνια νομική εγγύηση</li>
                  <li>• Καλύπτει ελαττώματα</li>
                  <li>• Δωρεάν επισκευή/αντικατάσταση</li>
                  <li>• Επιστροφή ή μείωση τιμής</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2 text-red-600" />
                <strong>Εξαίρεση:</strong> Προσαρμοσμένα προϊόντα δεν μπορούν να επιστραφούν εκτός αν έχουν ελαττώματα.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Επιστροφές και Ανταλλαγές</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Συνθήκες Επιστροφής:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Προϊόν σε αρχική κατάσταση</li>
                  <li>• Πλήρες συσκευασία</li>
                  <li>• Εντός 14 ημερών</li>
                  <li>• Ειδοποίηση προηγουμένως</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Διαδικασία:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Επικοινωνία με support</li>
                  <li>• Επιστροφή με courier</li>
                  <li>• Έλεγχος από εμάς</li>
                  <li>• Επιστροφή ποσού</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Δικαιώματα Πνευματικής Ιδιοκτησίας</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Όλα τα περιεχόμενα της ιστοσελίδας μας, συμπεριλαμβανομένων κειμένων, εικόνων, σχεδίων και λογισμικού, 
              είναι προστατευμένα από δικαιώματα πνευματικής ιδιοκτησίας.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Επιτρεπτό:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Προσωπική χρήση</li>
                  <li>• Προβολή περιεχομένου</li>
                  <li>• Δημιουργία παραγγελίας</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Απαγορευμένο:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Αντιγραφή περιεχομένου</li>
                  <li>• Εμπορική χρήση</li>
                  <li>• Τροποποίηση κώδικα</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Περιορισμός Ευθύνης</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Η εταιρεία μας δεν είναι υπεύθυνη για:
            </p>
            <ul className="text-sm space-y-2">
              <li>• Έμμεσες ή επακόλουθες ζημιές</li>
              <li>• Απώλεια κερδών ή δεδομένων</li>
              <li>• Διακοπές υπηρεσίας λόγω συντήρησης</li>
              <li>• Προβλήματα από τρίτους παρόχους</li>
              <li>• Κακόβουλη χρήση της υπηρεσίας</li>
            </ul>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <Shield className="w-4 h-4 inline mr-2 text-blue-600" />
                <strong>Προστασία:</strong> Η ευθύνη μας περιορίζεται στο ποσό της παραγγελίας σας.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>11. Επικοινωνία και Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Επικοινωνία:</h4>
                <p className="text-sm">
                  <Mail className="w-4 h-4 inline mr-2" />
                  info@puzzlecraft.gr<br/>
                  <Phone className="w-4 h-4 inline mr-2" />
                  +30 210 123 4567<br/>
                  <Clock className="w-4 h-4 inline mr-2" />
                  Δευ-Παρ: 9:00-18:00
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Support:</h4>
                <p className="text-sm">
                  • Live chat (στον ιστότοπο)<br/>
                  • Email support<br/>
                  • Τηλεφωνική υποστήριξη<br/>
                  • FAQ section
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>12. Αλλαγές στους Όρους</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Δικαιούμαστε να τροποποιούμε αυτούς τους όρους οποιαδήποτε στιγμή. 
              Σημαντικές αλλαγές θα γνωστοποιούνται μέσω email ή ειδοποίησης στον ιστότοπο. 
              Η συνέχιση της χρήσης μετά τις αλλαγές αποτελεί αποδοχή των νέων όρων.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>13. Εφαρμοστέο Δίκαιο</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Αυτοί οι όροι διέπονται από το ελληνικό δίκαιο. Οι διαφορές θα επιλύονται 
              από τα αρμόδια δικαστήρια της Αθήνας. Για καταναλωτικές διαφορές, 
              μπορείτε να απευθυνθείτε στην Ευρωπαϊκή Πλατφόρμα Διαδικτυακής Επίλυσης 
              Διαφορών (ODR).
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Αυτοί οι Όροι Χρήσης είναι συμβατοί με την ευρωπαϊκή νομοθεσία για την προστασία των καταναλωτών.
          </p>
        </div>
      </div>
    </div>
  );
}