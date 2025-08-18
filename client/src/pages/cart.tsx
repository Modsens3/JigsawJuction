import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Cart() {
  const { toast } = useToast();
  const { 
    items: cartItems, 
    removeItem: removeCartItem,
    updateQuantity: updateCartQuantity,
    getTotalPrice 
  } = useCartStore();

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartQuantity(id, newQuantity);
  };

  const removeItem = (id: string) => {
    removeCartItem(id);
    toast({ title: "Το προϊόν αφαιρέθηκε από το καλάθι" });
  };

  const subtotal = getTotalPrice();

  const shippingFree = subtotal >= 50;



  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-16">
              <h1 className="text-2xl font-bold text-neutral mb-4">Το καλάθι σας είναι άδειο</h1>
              <p className="text-gray-600 mb-8">Προσθέστε μερικά όμορφα παζλ για να ξεκινήσετε!</p>
              <Link href="/fractal-generator">
                <Button 
                  className="bg-primary text-white hover:bg-primary/90"
                  data-testid="button-create-puzzle"
                >
                  Δημιουργήστε Παζλ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral mb-8">Καλάθι Αγορών</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
                      alt="Puzzle preview" 
                      className="w-20 h-20 object-cover rounded-lg"
                      data-testid={`img-cart-item-${item.id}`}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold px-3" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-primary" data-testid={`text-price-${item.id}`}>
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Σύνοψη Παραγγελίας</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Υποσύνολο:</span>
                  <span className="font-semibold" data-testid="text-subtotal">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Μεταφορικά:</span>
                  <span className={`font-semibold ${shippingFree ? 'text-secondary' : ''}`} data-testid="text-shipping">
                    {shippingFree ? "Δωρεάν" : "€5.00"}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                  <span>Σύνολο:</span>
                  <span className="text-primary" data-testid="text-total">
                    €{(subtotal + (shippingFree ? 0 : 5)).toFixed(2)}
                  </span>
                </div>
                
                {!shippingFree && (
                  <p className="text-sm text-gray-600">
                    Προσθέστε €{(50 - subtotal).toFixed(2)} για δωρεάν μεταφορικά
                  </p>
                )}

                <Button 
                  className="w-full bg-accent text-white hover:bg-accent/90 mt-6"
                  size="lg"
                  asChild
                  data-testid="button-checkout"
                >
                  <Link href="/checkout">
                    Ολοκλήρωση Παραγγελίας
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                  data-testid="button-continue-shopping"
                >
                  <Link href="/fractal-generator">
                    Συνέχεια Αγορών
                  </Link>
                </Button>

                <div className="text-center text-sm text-gray-500 mt-4">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8.5h.01M10 17h4" />
                  </svg>
                  Ασφαλής πληρωμή
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
