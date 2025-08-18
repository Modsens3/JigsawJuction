import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  Settings, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Search,
  Package,
  Calendar,
  User
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Αναμονή",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    description: "Η παραγγελία σας περιμένει επεξεργασία",
    step: 1
  },
  processing: {
    label: "Επεξεργασία",
    icon: Settings,
    color: "bg-blue-100 text-blue-800",
    description: "Η παραγγελία σας βρίσκεται σε επεξεργασία",
    step: 2
  },
  shipped: {
    label: "Αποστολή",
    icon: Truck,
    color: "bg-purple-100 text-purple-800",
    description: "Η παραγγελία σας έχει αποσταλεί",
    step: 3
  },
  completed: {
    label: "Ολοκληρώθηκε",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    description: "Η παραγγελία σας έχει παραδοθεί",
    step: 4
  },
  cancelled: {
    label: "Ακυρώθηκε",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    description: "Η παραγγελία σας έχει ακυρωθεί",
    step: 0
  }
};

const steps = [
  { id: 1, label: "Παραγγελία Υποβλήθηκε", icon: Package },
  { id: 2, label: "Επεξεργασία", icon: Settings },
  { id: 3, label: "Αποστολή", icon: Truck },
  { id: 4, label: "Παράδοση", icon: CheckCircle }
];

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!orderId || !orderId.trim()) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε τον αριθμό παραγγελίας",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest('GET', `/api/orders/${orderId}/track`);
      setTrackingData(data);
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν βρέθηκε παραγγελία με αυτόν τον αριθμό",
        variant: "destructive"
      });
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatus = trackingData ? statusConfig[trackingData.status as keyof typeof statusConfig] : null;
  const currentStep = currentStatus?.step || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Παρακολούθηση Παραγγελίας</h1>
        <p className="text-gray-600">Εισάγετε τον αριθμό παραγγελίας σας για να δείτε την κατάσταση</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Αριθμός Παραγγελίας (π.χ. ORD-123456789)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                "Αναζήτηση..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Αναζήτηση
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingData && (
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Παραγγελία #{trackingData.orderId}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{trackingData.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Ημ/νία: {new Date(trackingData.createdAt).toLocaleDateString('el-GR')}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Προϊόντα:</h4>
                <ul className="space-y-1">
                  {trackingData.items.map((item: any, index: number) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {item.name} (Ποσότητα: {item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Κατάσταση Παραγγελίας</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Status */}
                {currentStatus && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <currentStatus.icon className="w-6 h-6" />
                    <div>
                      <Badge className={currentStatus.color}>
                        {currentStatus.label}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentStatus.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Steps */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = step.id <= currentStep;
                      const isCurrent = step.id === currentStep;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center border-2
                            ${isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'bg-gray-200 border-gray-300 text-gray-500'
                            }
                            ${isCurrent ? 'ring-4 ring-green-200' : ''}
                          `}>
                            <StepIcon className="w-6 h-6" />
                          </div>
                          <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          {trackingData.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Πληροφορίες Αποστολής</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <span><strong>Tracking Number:</strong> {trackingData.trackingNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span><strong>Μέθοδος Αποστολής:</strong> {trackingData.shippingMethod}</span>
                </div>
                {trackingData.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span><strong>Τελευταία Ενημέρωση:</strong> {new Date(trackingData.updatedAt).toLocaleString('el-GR')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
