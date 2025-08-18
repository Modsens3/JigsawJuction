import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

export default function OrderConfirmation() {
  // In real app, would get order details from URL params or state
  const mockOrder = {
    id: "ORD-1723456789",
    date: new Date().toLocaleDateString('el-GR'),
    total: 89.90,
    status: "confirmed",
    estimatedDelivery: "3-7 εργάσιμες ημέρες",
    trackingNumber: "TR123456789GR",
    customerEmail: "customer@example.com"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Η παραγγελία σας ολοκληρώθηκε!
          </h1>
          <p className="text-lg text-gray-600">
            Θα λάβετε email επιβεβαίωσης σύντομα
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Στοιχεία Παραγγελίας</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Αριθμός Παραγγελίας</p>
                <p className="font-semibold text-lg">{mockOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ημερομηνία</p>
                <p className="font-semibold">{mockOrder.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Συνολικό Ποσό</p>
                <p className="font-semibold text-lg text-green-600">€{mockOrder.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Κατάσταση</p>
                <p className="font-semibold text-green-600 capitalize">Επιβεβαιωμένη</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Πληροφορίες Παράδοσης
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Εκτιμώμενη Παράδοση</p>
                <p className="font-semibold">{mockOrder.estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Κωδικός Παρακολούθησης</p>
                <p className="font-semibold text-blue-600">{mockOrder.trackingNumber}</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Σημείωση:</strong> Θα λάβετε email με τον κωδικό παρακολούθησης μόλις η παραγγελία σας αποσταλεί.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Επόμενα Βήματα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Επιβεβαίωσης</h3>
                  <p className="text-sm text-muted-foreground">
                    Θα στείλουμε επιβεβαίωση στο {mockOrder.customerEmail} με όλες τις λεπτομέρειες.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Προετοιμασία Παραγγελίας</h3>
                  <p className="text-sm text-muted-foreground">
                    Η ομάδα μας θα ξεκινήσει την προετοιμασία του παζλ σας εντός 24 ωρών.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Παρακολούθηση Παράδοσης</h3>
                  <p className="text-sm text-muted-foreground">
                    Μπορείτε να παρακολουθήσετε την παραγγελία σας χρησιμοποιώντας τον κωδικό παρακολούθησης.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/order-tracking" data-testid="button-track-order">
              Παρακολούθηση Παραγγελίας
            </Link>
          </Button>
          
          <Button asChild>
            <Link href="/fractal-generator" data-testid="button-create-another">
              Δημιούργησε Άλλο Παζλ
            </Link>
          </Button>
        </div>

        {/* Support Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Χρειάζεστε Βοήθεια;</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-sm text-muted-foreground">support@fractalcraft.gr</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Τηλέφωνο</p>
                  <p className="text-sm text-muted-foreground">+30 210 123 4567</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/contact" data-testid="button-contact-support">
                  Επικοινωνία με την Υποστήριξη
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}