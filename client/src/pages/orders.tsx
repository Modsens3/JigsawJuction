import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, ExternalLink, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { format } from "date-fns";
import { el } from 'date-fns/locale';

interface OrderItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
  items: OrderItem[];
  trackingNumber?: string;
}

const statusConfig = {
  pending: { label: 'Σε Αναμονή', color: 'secondary', icon: Clock },
  processing: { label: 'Επεξεργασία', color: 'default', icon: Package },
  shipped: { label: 'Στάλθηκε', color: 'default', icon: Truck },
  completed: { label: 'Ολοκληρώθηκε', color: 'default', icon: CheckCircle },
  cancelled: { label: 'Ακυρώθηκε', color: 'destructive', icon: Package }
};

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/user/orders'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p>Παρακαλώ συνδεθείτε για να δείτε τις παραγγελίες σας</p>
            <Link href="/login">
              <Button className="mt-4">Σύνδεση</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Φορτώνονται οι παραγγελίες...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p>Σφάλμα κατά τη φόρτωση των παραγγελιών</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Δοκιμάστε ξανά
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm" data-testid="button-back-profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Προφίλ
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Οι Παραγγελίες μου
            </h1>
            <p className="text-muted-foreground">
              Παρακολουθήστε τις παραγγελίες σας και την πρόοδό τους
            </p>
          </div>
        </div>

        {/* Orders List */}
        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              
              return (
                <Card key={order.id} className="glass-morphism border-primary/20">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">
                          Παραγγελία #{order.orderNumber}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{format(new Date(order.createdAt), 'dd MMMM yyyy, HH:mm', { locale: el })}</span>
                          <Separator orientation="vertical" className="h-4" />
                          <span>€{order.total.toFixed(2)}</span>
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={statusConfig[order.status].color as any}
                          className="flex items-center gap-1"
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig[order.status].label}
                        </Badge>
                        
                        {order.trackingNumber && (
                          <Link href={`/order-tracking?orderNumber=${order.orderNumber}`}>
                            <Button variant="outline" size="sm" data-testid={`button-track-${order.id}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Παρακολούθηση
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            {item.image && item.image.startsWith('blob:') ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="w-full h-full flex items-center justify-center" style={{ display: item.image && item.image.startsWith('blob:') ? 'none' : 'flex' }}>
                              <Package className="w-8 h-8 text-primary/50" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>Ποσότητα: {item.quantity}</span>
                              <span className="font-medium">€{item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {order.trackingNumber && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Αριθμός Παρακολούθησης:</span>
                            <Badge variant="outline" className="font-mono">
                              {order.trackingNumber}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-morphism border-primary/20">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Δεν έχετε παραγγελίες</h3>
              <p className="text-muted-foreground mb-6">
                Ανακαλύψτε τα μοναδικά fractal παζλ μας και κάντε την πρώτη σας παραγγελία!
              </p>
              <Link href="/puzzle-generator">
                <Button data-testid="button-start-shopping">
                  <Package className="w-4 h-4 mr-2" />
                  Αρχίστε τις Αγορές
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}