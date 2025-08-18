import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp
} from "lucide-react";

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Mock customers data
  const mockCustomers = [
    {
      id: "CUST-001",
      name: "Μαρία Παπαδάκη",
      email: "maria@example.com",
      phone: "+30 6912345678",
      address: "Ακαδημίας 15, Αθήνα 10671",
      registrationDate: "2025-03-15T10:00:00Z",
      lastOrderDate: "2025-08-12T10:30:00Z",
      totalOrders: 8,
      totalSpent: 687.40,
      averageOrderValue: 85.93,
      status: "active",
      orderHistory: [
        { id: "ORD-001", date: "2025-08-12", total: 157.40, status: "processing" },
        { id: "ORD-015", date: "2025-08-05", total: 89.90, status: "delivered" },
        { id: "ORD-028", date: "2025-07-28", total: 124.50, status: "delivered" },
        { id: "ORD-034", date: "2025-07-15", total: 67.30, status: "delivered" },
        { id: "ORD-041", date: "2025-07-02", total: 98.70, status: "delivered" },
      ]
    },
    {
      id: "CUST-002",
      name: "Γιάννης Κωστόπουλος",
      email: "giannis@example.com",
      phone: "+30 6987654321",
      address: "Πατησίων 120, Αθήνα 11251",
      registrationDate: "2025-01-22T14:30:00Z",
      lastOrderDate: "2025-08-11T15:20:00Z",
      totalOrders: 12,
      totalSpent: 1234.80,
      averageOrderValue: 102.90,
      status: "active",
      orderHistory: [
        { id: "ORD-002", date: "2025-08-11", total: 124.90, status: "shipped" },
        { id: "ORD-012", date: "2025-08-03", total: 156.70, status: "delivered" },
        { id: "ORD-019", date: "2025-07-25", total: 78.20, status: "delivered" },
      ]
    },
    {
      id: "CUST-003",
      name: "Ελένη Αντωνίου",
      email: "eleni@example.com",
      phone: "+30 6976543210",
      address: "Βουκουρεστίου 8, Αθήνα 10671",
      registrationDate: "2025-06-10T09:15:00Z",
      lastOrderDate: "2025-08-10T12:45:00Z",
      totalOrders: 3,
      totalSpent: 245.60,
      averageOrderValue: 81.87,
      status: "active",
      orderHistory: [
        { id: "ORD-003", date: "2025-08-10", total: 67.30, status: "delivered" },
        { id: "ORD-022", date: "2025-07-20", total: 89.90, status: "delivered" },
        { id: "ORD-031", date: "2025-06-15", total: 88.40, status: "delivered" },
      ]
    },
    {
      id: "CUST-004",
      name: "Νίκος Σταθόπουλος",
      email: "nikos@example.com",
      phone: "+30 6965432109",
      address: "Κηφισίας 25, Κηφισιά 14562",
      registrationDate: "2024-11-08T16:45:00Z",
      lastOrderDate: "2025-05-14T11:20:00Z",
      totalOrders: 15,
      totalSpent: 1876.30,
      averageOrderValue: 125.09,
      status: "inactive",
      orderHistory: [
        { id: "ORD-087", date: "2025-05-14", total: 143.20, status: "delivered" },
        { id: "ORD-076", date: "2025-05-02", total: 97.50, status: "delivered" },
        { id: "ORD-065", date: "2025-04-28", total: 189.90, status: "delivered" },
      ]
    },
  ];

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "secondary" as const,
      inactive: "outline" as const
    };
    
    const labels = {
      active: "Ενεργός",
      inactive: "Ανενεργός"
    };

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      pending: "outline" as const,
      processing: "default" as const,
      shipped: "secondary" as const,
      delivered: "secondary" as const,
      cancelled: "destructive" as const
    };

    const labels = {
      pending: "Εκκρεμεί",
      processing: "Επεξεργασία",
      shipped: "Αποστάλη",
      delivered: "Παραδόθηκε",
      cancelled: "Ακυρώθηκε"
    };

    return <Badge variant={variants[status as keyof typeof variants]} className="text-xs">{labels[status as keyof typeof labels]}</Badge>;
  };

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 1500) return { label: "VIP", color: "text-yellow-600 bg-yellow-50" };
    if (totalSpent >= 800) return { label: "Gold", color: "text-orange-600 bg-orange-50" };
    if (totalSpent >= 300) return { label: "Silver", color: "text-gray-600 bg-gray-50" };
    return { label: "Bronze", color: "text-amber-600 bg-amber-50" };
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Διαχείριση Πελατών</h1>
          <p className="text-muted-foreground">Προβολή και διαχείριση πληροφοριών πελατών</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Συνολικά Πελάτες: {filteredCustomers.length}
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Αναζήτηση πελατών (όνομα, email, ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-customers"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικοί Πελάτες</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomers.length}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% αυτό το μήνα
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ενεργοί Πελάτες</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCustomers.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((mockCustomers.filter(c => c.status === 'active').length / mockCustomers.length) * 100)}% του συνόλου
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Μέσος Όρος Αξίας</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(mockCustomers.reduce((sum, c) => sum + c.averageOrderValue, 0) / mockCustomers.length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ανά παραγγελία</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Από όλους τους πελάτες</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Πελάτες ({filteredCustomers.length})</CardTitle>
          <CardDescription>Όλοι οι εγγεγραμμένοι πελάτες με στατιστικά στοιχεία</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Πελάτης</TableHead>
                <TableHead>Επαφή</TableHead>
                <TableHead>Εγγραφή</TableHead>
                <TableHead>Παραγγελίες</TableHead>
                <TableHead>Σύνολο</TableHead>
                <TableHead>Μέσος Όρος</TableHead>
                <TableHead>Επίπεδο</TableHead>
                <TableHead>Κατάσταση</TableHead>
                <TableHead>Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const tier = getCustomerTier(customer.totalSpent);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {new Date(customer.registrationDate).toLocaleDateString('el-GR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {customer.totalOrders}
                    </TableCell>
                    <TableCell className="font-medium">
                      €{customer.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      €{customer.averageOrderValue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${tier.color} border-0`}>
                        {tier.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(customer.status)}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                            data-testid={`button-view-customer-${customer.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Προφίλ Πελάτη - {selectedCustomer?.name}</DialogTitle>
                            <DialogDescription>
                              Αναλυτικές πληροφορίες και ιστορικό παραγγελιών
                            </DialogDescription>
                          </DialogHeader>
                          {selectedCustomer && (
                            <div className="space-y-6">
                              {/* Customer Overview */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <MapPin className="w-5 h-5" />
                                      Στοιχεία Επικοινωνίας
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div>
                                      <span className="font-medium">Email:</span> {selectedCustomer.email}
                                    </div>
                                    <div>
                                      <span className="font-medium">Τηλέφωνο:</span> {selectedCustomer.phone}
                                    </div>
                                    <div>
                                      <span className="font-medium">Διεύθυνση:</span><br />
                                      {selectedCustomer.address}
                                    </div>
                                    <div>
                                      <span className="font-medium">Εγγραφή:</span> {new Date(selectedCustomer.registrationDate).toLocaleDateString('el-GR')}
                                    </div>
                                    <div>
                                      <span className="font-medium">Τελευταία Παραγγελία:</span> {new Date(selectedCustomer.lastOrderDate).toLocaleDateString('el-GR')}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <TrendingUp className="w-5 h-5" />
                                      Στατιστικά Στοιχεία
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="font-medium">Συνολικές Παραγγελίες:</span>
                                      <span>{selectedCustomer.totalOrders}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Συνολικά Έσοδα:</span>
                                      <span className="font-bold">€{selectedCustomer.totalSpent.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Μέσος Όρος Παραγγελίας:</span>
                                      <span>€{selectedCustomer.averageOrderValue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Επίπεδο Πελάτη:</span>
                                      <Badge className={`${getCustomerTier(selectedCustomer.totalSpent).color} border-0`}>
                                        {getCustomerTier(selectedCustomer.totalSpent).label}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium">Κατάσταση:</span>
                                      {getStatusBadge(selectedCustomer.status)}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Order History */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Ιστορικό Παραγγελιών ({selectedCustomer.orderHistory.length})
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Παραγγελία</TableHead>
                                        <TableHead>Ημερομηνία</TableHead>
                                        <TableHead>Σύνολο</TableHead>
                                        <TableHead>Κατάσταση</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedCustomer.orderHistory.map((order: any) => (
                                        <TableRow key={order.id}>
                                          <TableCell className="font-medium">{order.id}</TableCell>
                                          <TableCell>{new Date(order.date).toLocaleDateString('el-GR')}</TableCell>
                                          <TableCell className="font-medium">€{order.total.toFixed(2)}</TableCell>
                                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}