import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { X, Minus, Plus, ShoppingCart as ShoppingCartIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ShoppingCartProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ShoppingCart({ isOpen = false, onClose = () => {} }: ShoppingCartProps) {
  const { toast } = useToast();
  const { 
    items: cartItems, 
    removeItem: removeCartItem,
    updateQuantity: updateCartQuantity,
    getTotalItems,
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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        data-testid="cart-overlay"
      />

      {/* Cart Sidebar */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-neutral">Καλάθι Αγορών</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral mb-2">Το καλάθι σας είναι άδειο</h3>
              <p className="text-gray-600 mb-6">Προσθέστε μερικά όμορφα παζλ για να ξεκινήσετε!</p>
              <Link href="/fractal-generator">
                <Button onClick={onClose} data-testid="button-start-shopping">
                  Ξεκινήστε Αγορές
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center space-x-4 pb-4 border-b"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img 
                    src={item.image || "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
                    alt="Puzzle preview" 
                    className="w-16 h-16 object-cover rounded-lg"
                    data-testid={`img-cart-item-${item.id}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm" data-testid={`quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm" data-testid={`price-${item.id}`}>
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          Αφαίρεση
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Υποσύνολο:</span>
              <span data-testid="cart-subtotal">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Μεταφορικά:</span>
              <span className={shippingFree ? "text-green-600" : ""} data-testid="cart-shipping">
                {shippingFree ? "Δωρεάν" : "€5.00"}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Σύνολο:</span>
                <span data-testid="cart-total">€{(shippingFree ? subtotal : subtotal + 5).toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Link href="/checkout">
                <Button 
                  className="w-full" 
                  onClick={onClose}
                  data-testid="button-checkout"
                >
                  Ολοκλήρωση Παραγγελίας
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onClose}
                data-testid="button-continue-shopping"
              >
                Συνεχίστε Αγορές
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
