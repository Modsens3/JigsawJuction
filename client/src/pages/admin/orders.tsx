import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter,
  Eye,
  Download,
  Printer,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrderStatusManager from "@/components/admin/order-status-manager";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiRequest('GET', '/api/admin/orders');
        setOrders(data.orders || data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η φόρτωση των παραγγελιών",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Mock orders data for fallback
  const mockOrders = [
    {
      id: "ORD-001",
      customer: {
        name: "Μαρία Παπαδάκη",
        email: "maria@example.com",
        phone: "+30 6912345678",
        address: "Ακαδημίας 15, Αθήνα 10671"
      },
      items: [
        { name: "Fractal Mandala Premium", quantity: 1, price: 89.90 },
        { name: "Sacred Geometry", quantity: 1, price: 67.50 }
      ],
      total: 157.40,
      status: "processing",
      paymentMethod: "card",
      createdAt: "2025-08-12T10:30:00Z",
      updatedAt: "2025-08-12T11:00:00Z"
    },
    {
      id: "ORD-002",
      customer: {
        name: "Γιάννης Κωστόπουλος",
        email: "giannis@example.com",
        phone: "+30 6987654321",
        address: "Πατησίων 120, Αθήνα 11251"
      },
      items: [
        { name: "Cosmic Patterns", quantity: 1, price: 124.90 }
      ],
      total: 124.90,
      status: "shipped",
      paymentMethod: "paypal",
      createdAt: "2025-08-11T15:20:00Z",
      updatedAt: "2025-08-12T09:15:00Z"
    },
    {
      id: "ORD-003",
      customer: {
        name: "Ελένη Αντωνίου",
        email: "eleni@example.com",
        phone: "+30 6976543210",
        address: "Βουκουρεστίου 8, Αθήνα 10671"
      },
      items: [
        { name: "Custom Puzzle", quantity: 1, price: 67.30 }
      ],
      total: 67.30,
      status: "delivered",
      paymentMethod: "bank_transfer",
      createdAt: "2025-08-10T12:45:00Z",
      updatedAt: "2025-08-11T16:30:00Z"
    },
    {
      id: "ORD-004",
      customer: {
        name: "Νίκος Σταθόπουλος",
        email: "nikos@example.com",
        phone: "+30 6965432109",
        address: "Κηφισίας 25, Κηφισιά 14562"
      },
      items: [
        { name: "Fractal Mandala Premium", quantity: 2, price: 179.80 }
      ],
      total: 179.80,
      status: "pending",
      paymentMethod: "cash_on_delivery",
      createdAt: "2025-08-11T08:15:00Z",
      updatedAt: "2025-08-11T08:15:00Z"
    },
  ];

  const statusOptions = [
    { value: "all", label: "Όλες οι Καταστάσεις" },
    { value: "pending", label: "Εκκρεμεί" },
    { value: "processing", label: "Επεξεργασία" },
    { value: "shipped", label: "Αποστάλη" },
    { value: "delivered", label: "Παραδόθηκε" },
    { value: "cancelled", label: "Ακυρώθηκε" },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: "outline" as const, label: "Εκκρεμεί", icon: Clock },
      processing: { variant: "default" as const, label: "Επεξεργασία", icon: Package },
      shipped: { variant: "secondary" as const, label: "Αποστάλη", icon: Truck },
      delivered: { variant: "secondary" as const, label: "Παραδόθηκε", icon: CheckCircle },
      cancelled: { variant: "destructive" as const, label: "Ακυρώθηκε", icon: XCircle }
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className="text-xs flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: "Πιστωτική Κάρτα",
      paypal: "PayPal",
      bank_transfer: "Τραπεζική Μεταφορά",
      cash_on_delivery: "Αντικαταβολή"
    };
    return labels[method] || method;
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    toast({
      title: "Κατάσταση Ενημερώθηκε",
      description: `Η παραγγελία ${orderId} ενημερώθηκε σε "${statusOptions.find(s => s.value === newStatus)?.label}".`,
    });
  };

  const handleExportCSV = () => {
    // Mock CSV export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Customer,Email,Total,Status,Date\n" +
      filteredOrders.map(order => 
        `${order.id},"${order.customer.name}",${order.customer.email},${order.total},${order.status},${new Date(order.createdAt).toLocaleDateString('el-GR')}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Εξαγωγή Επιτυχής",
      description: `${filteredOrders.length} παραγγελίες εξάχθηκαν σε CSV.`,
    });
  };

  const handlePrintOrder = (order: any) => {
    toast({
      title: "Εκτύπωση Παραγγελίας",
      description: `Η παραγγελία ${order.id} στέλνεται για εκτύπωση.`,
    });
  };

  // Helper function to generate SVG from design data
  const generateSVGFromDesign = (designData: any) => {
    const { pieces, width, height, material } = designData;
    
    // Simple SVG generation for puzzle pieces
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <pattern id="puzzle-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0,10 Q5,5 10,10 Q15,15 20,10" stroke="#333" stroke-width="1" fill="none"/>
            <path d="M0,10 Q5,15 10,10 Q15,5 20,10" stroke="#333" stroke-width="1" fill="none"/>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#puzzle-pattern)"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
          ${pieces} pieces - ${material}
        </text>
      </svg>
    `;
    
    return svgContent;
  };

  // Helper function to download SVG
  const downloadSVG = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Λήψη SVG",
      description: `Το αρχείο ${filename} κατέβηκε επιτυχώς.`,
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Διαχείριση Παραγγελιών</h1>
          <p className="text-muted-foreground">Παρακολούθηση και διαχείριση παραγγελιών</p>
        </div>
        <Button onClick={handleExportCSV} data-testid="button-export-csv">
          <Download className="w-4 h-4 mr-2" />
          Εξαγωγή CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση παραγγελιών (ID, πελάτης, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-orders"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Παραγγελίες ({filteredOrders.length})</CardTitle>
          <CardDescription>Όλες οι παραγγελίες με δυνατότητα ενημέρωσης κατάστασης</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Παραγγελία</TableHead>
                <TableHead>Πελάτης</TableHead>
                <TableHead>Προϊόντα</TableHead>
                <TableHead>Σύνολο</TableHead>
                <TableHead>Κατάσταση</TableHead>
                <TableHead>Πληρωμή</TableHead>
                <TableHead>Ημερομηνία</TableHead>
                <TableHead>Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx}>
                          {item} x1
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">€{order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <span className="text-xs">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">
                      {new Date(order.createdAt).toLocaleDateString('el-GR')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Λεπτομέρειες Παραγγελίας {selectedOrder?.id}</DialogTitle>
                            <DialogDescription>
                              Πλήρες προφίλ και ιστορικό παραγγελίας
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div>
                                <h3 className="font-semibold mb-2">Στοιχεία Πελάτη</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Όνομα:</span> {selectedOrder.customer}
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span> {selectedOrder.customerEmail}
                                  </div>
                                  <div>
                                    <span className="font-medium">Ημ/νία:</span> {selectedOrder.date}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-medium">Κατάσταση:</span> {selectedOrder.status}
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-2">Προϊόντα</h3>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <span>{item}</span>
                                      <div className="text-right">
                                        <span className="font-medium">x1</span>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex justify-between font-bold border-t pt-2">
                                    <span>Σύνολο:</span>
                                    <span>€{selectedOrder.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* File Downloads */}
                              {selectedOrder.imageUrl && (
                                <div>
                                  <h3 className="font-semibold mb-2">Λήψη Αρχείων</h3>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(selectedOrder.imageUrl, '_blank')}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Λήψη Εικόνας
                                    </Button>
                                    {selectedOrder.designData && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          // Generate and download SVG
                                          const svgContent = generateSVGFromDesign(selectedOrder.designData);
                                          downloadSVG(svgContent, `design-${selectedOrder.id}.svg`);
                                        }}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Λήψη SVG
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order Status Manager */}
                              <OrderStatusManager 
                                order={{
                                  id: selectedOrder.id,
                                  customer: selectedOrder.customer.name,
                                  email: selectedOrder.customer.email,
                                  total: selectedOrder.total,
                                  status: selectedOrder.status,
                                  date: new Date(selectedOrder.createdAt).toLocaleDateString('el-GR'),
                                  items: selectedOrder.items.map((item: any) => item.name),
                                  trackingNumber: selectedOrder.trackingNumber,
                                  shippingMethod: selectedOrder.shippingMethod
                                }}
                                onStatusUpdate={() => {
                                  // Refresh orders data
                                  toast({
                                    title: "Επιτυχία!",
                                    description: "Η κατάσταση ενημερώθηκε",
                                  });
                                }}
                              />

                              {/* Timeline */}
                              <div>
                                <h3 className="font-semibold mb-2">Χρονολόγιο</h3>
                                <div className="text-sm space-y-1">
                                  <div>
                                    <span className="font-medium">Δημιουργία:</span> {new Date(selectedOrder.createdAt).toLocaleString('el-GR')}
                                  </div>
                                  <div>
                                    <span className="font-medium">Τελευταία Ενημέρωση:</span> {new Date(selectedOrder.updatedAt).toLocaleString('el-GR')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePrintOrder(order)}
                        data-testid={`button-print-order-quick-${order.id}`}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}