import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  Settings, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Download,
  FileText,
  Package
} from "lucide-react";

interface OrderStatusManagerProps {
  order: {
    id: string;
    customer: string;
    email: string;
    total: number;
    status: string;
    date: string;
    items: string[];
    trackingNumber?: string;
    shippingMethod?: string;
  };
  onStatusUpdate: () => void;
}

const statusConfig = {
  pending: {
    label: "Αναμονή",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
    description: "Η παραγγελία περιμένει επεξεργασία"
  },
  processing: {
    label: "Επεξεργασία",
    icon: Settings,
    color: "bg-blue-100 text-blue-800",
    description: "Η παραγγελία βρίσκεται σε επεξεργασία"
  },
  shipped: {
    label: "Αποστολή",
    icon: Truck,
    color: "bg-purple-100 text-purple-800",
    description: "Η παραγγελία έχει αποσταλεί"
  },
  completed: {
    label: "Ολοκληρώθηκε",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    description: "Η παραγγελία έχει παραδοθεί"
  },
  cancelled: {
    label: "Ακυρώθηκε",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
    description: "Η παραγγελία έχει ακυρωθεί"
  }
};

export default function OrderStatusManager({ order, onStatusUpdate }: OrderStatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [shippingMethod, setShippingMethod] = useState(order.shippingMethod || "ΕΛΤΑ Courier");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingVoucher, setIsGeneratingVoucher] = useState(false);
  const { toast } = useToast();

  const currentStatus = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || Clock;

  const handleStatusUpdate = async () => {
    if (selectedStatus === order.status) return;
    
    setIsUpdating(true);
    try {
      await apiRequest('PATCH', `/api/admin/orders/${order.id}/status`, {
        status: selectedStatus
      });
      
      toast({
        title: "Επιτυχία!",
        description: `Η κατάσταση της παραγγελίας άλλαξε σε "${statusConfig[selectedStatus as keyof typeof statusConfig]?.label}"`,
      });
      
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ενημέρωση της κατάστασης",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateVoucher = async () => {
    setIsGeneratingVoucher(true);
    try {
      const response = await apiRequest('POST', `/api/admin/orders/${order.id}/voucher`, {
        trackingNumber: trackingNumber || undefined,
        shippingMethod: shippingMethod
      });
      
      toast({
        title: "Voucher Δημιουργήθηκε!",
        description: `Tracking Number: ${response.voucher.trackingNumber}`,
      });
      
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η δημιουργία του voucher",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingVoucher(false);
    }
  };

  const handleDownloadFiles = async (type: 'image' | 'design') => {
    try {
      const response = await fetch(`/api/admin/download-${type}/${order.id}`);
      
      if (type === 'image') {
        const data = await response.json();
        // Open image in new tab
        window.open(data.imageUrl, '_blank');
      } else {
        // Download SVG file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${order.id}-${type}.svg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast({
        title: "Επιτυχία!",
        description: `Το αρχείο ${type === 'image' ? 'εικόνας' : 'σχεδίου'} κατέβηκε`,
      });
    } catch (error) {
      toast({
        title: "Σφάλμα",
        description: `Δεν ήταν δυνατή η λήψη του αρχείου ${type === 'image' ? 'εικόνας' : 'σχεδίου'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Διαχείριση Παραγγελίας #{order.id}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <StatusIcon className="w-5 h-5" />
          <div>
            <Badge className={currentStatus?.color}>
              {currentStatus?.label}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {currentStatus?.description}
            </p>
          </div>
        </div>

        {/* Status Update */}
        <div className="space-y-4">
          <h3 className="font-semibold">Αλλαγή Κατάστασης</h3>
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStatusUpdate} 
              disabled={isUpdating || selectedStatus === order.status}
              size="sm"
            >
              {isUpdating ? "Ενημέρωση..." : "Ενημέρωση"}
            </Button>
          </div>
        </div>

        {/* File Downloads */}
        <div className="space-y-4">
          <h3 className="font-semibold">Λήψη Αρχείων</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadFiles('image')}
            >
              <Download className="w-4 h-4 mr-2" />
              Εικόνα
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadFiles('design')}
            >
              <FileText className="w-4 h-4 mr-2" />
              SVG Σχέδιο
            </Button>
          </div>
        </div>

        {/* Voucher Generation */}
        {order.status === 'processing' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Δημιουργία Voucher Αποστολής</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="TRK-123456789"
                />
              </div>
              <div>
                <Label htmlFor="shippingMethod">Μέθοδος Αποστολής</Label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ΕΛΤΑ Courier">ΕΛΤΑ Courier</SelectItem>
                    <SelectItem value="ACS Courier">ACS Courier</SelectItem>
                    <SelectItem value="Speedex">Speedex</SelectItem>
                    <SelectItem value="Γενική Ταχυδρομική">Γενική Ταχυδρομική</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleGenerateVoucher}
              disabled={isGeneratingVoucher}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingVoucher ? "Δημιουργία..." : "Δημιουργία Voucher"}
            </Button>
          </div>
        )}

        {/* Tracking Info */}
        {order.trackingNumber && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Πληροφορίες Αποστολής</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
              <p><strong>Μέθοδος:</strong> {order.shippingMethod}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
