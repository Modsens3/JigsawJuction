import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useCartStore } from "@/lib/cart-store";
import { CreditCard, Truck, MapPin, User, Mail, Phone } from "lucide-react";

const checkoutSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
  lastName: z.string().min(2, "Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
  email: z.string().email("Εισάγετε έγκυρο email"),
  phone: z.string().min(10, "Εισάγετε έγκυρο τηλέφωνο"),
  
  // Shipping Address
  address: z.string().min(5, "Η διεύθυνση πρέπει να έχει τουλάχιστον 5 χαρακτήρες"),
  city: z.string().min(2, "Η πόλη πρέπει να έχει τουλάχιστον 2 χαρακτήρες"),
  postalCode: z.string().min(5, "Ο ταχυδρομικός κώδικας πρέπει να έχει τουλάχιστον 5 χαρακτήρες"),
  
  // Payment Method
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer", "cash_on_delivery"]),
  
  // Credit Card (conditional)
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  cardHolderName: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: cartItems, getTotalPrice, clearCart } = useCartStore();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      paymentMethod: "credit_card",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardHolderName: "",
    },
  });

  const watchPaymentMethod = form.watch("paymentMethod");

  const subtotal = getTotalPrice();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.24; // Greek VAT 24%
  const total = subtotal + shipping + tax;

  const submitOrderMutation = useMutation({
    mutationFn: async (orderData: CheckoutForm) => {
      return await apiRequest('POST', '/api/orders', {
        ...orderData,
        items: cartItems,
        subtotal,
        shipping,
        tax,
        total,
      });
    },
    onSuccess: (data) => {
      clearCart();
      toast({
        title: "Παραγγελία Ολοκληρώθηκε!",
        description: "Η παραγγελία σας υποβλήθηκε επιτυχώς.",
      });
      setLocation('/order-confirmation');
    },
    onError: (error: Error) => {
      toast({
        title: "Σφάλμα Παραγγελίας",
        description: error.message || "Δεν ήταν δυνατή η επεξεργασία της παραγγελίας σας.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: "Άδειο Καλάθι",
        description: "Προσθέστε προϊόντα στο καλάθι πριν την ολοκλήρωση της παραγγελίας.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitOrderMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Card>
            <CardContent className="py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Το καλάθι σας είναι άδειο</h1>
              <p className="text-gray-600 mb-8">Προσθέστε προϊόντα για να προχωρήσετε στην ολοκλήρωση της παραγγελίας.</p>
              <Button onClick={() => setLocation('/fractal-generator')} data-testid="button-back-to-shopping">
                Επιστροφή στις Αγορές
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ολοκλήρωση Παραγγελίας</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Προσωπικά Στοιχεία
                    </CardTitle>
                    <CardDescription>Συμπληρώστε τα στοιχεία επικοινωνίας σας</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Όνομα</FormLabel>
                            <FormControl>
                              <Input placeholder="Γιάννης" data-testid="input-first-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Επώνυμο</FormLabel>
                            <FormControl>
                              <Input placeholder="Παπαδόπουλος" data-testid="input-last-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="email" placeholder="john@example.com" className="pl-10" data-testid="input-email" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Τηλέφωνο</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="+30 123 456 7890" className="pl-10" data-testid="input-phone" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Διεύθυνση Παράδοσης
                    </CardTitle>
                    <CardDescription>Πού θα θέλατε να παραδοθεί η παραγγελία σας;</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Διεύθυνση</FormLabel>
                          <FormControl>
                            <Input placeholder="Οδός Παπάφη 25" data-testid="input-address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Πόλη</FormLabel>
                            <FormControl>
                              <Input placeholder="Αθήνα" data-testid="input-city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ταχυδρομικός Κώδικας</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" data-testid="input-postal-code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Τρόπος Πληρωμής
                    </CardTitle>
                    <CardDescription>Επιλέξτε πώς θέλετε να πληρώσετε</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <label htmlFor="credit_card" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Πιστωτική/Χρεωστική Κάρτα</div>
                                  <div className="text-sm text-muted-foreground">Visa, Mastercard, American Express</div>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <label htmlFor="paypal" className="flex-1 cursor-pointer">
                                  <div className="font-medium">PayPal</div>
                                  <div className="text-sm text-muted-foreground">Πληρωμή μέσω PayPal</div>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                <label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Τραπεζική Μεταφορά</div>
                                  <div className="text-sm text-muted-foreground">Πληρωμή με τραπεζικό έμβασμα</div>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                                <label htmlFor="cash_on_delivery" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Αντικαταβολή</div>
                                  <div className="text-sm text-muted-foreground">Πληρωμή κατά την παράδοση (+€2.00)</div>
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Credit Card Details */}
                    {watchPaymentMethod === "credit_card" && (
                      <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                        <FormField
                          control={form.control}
                          name="cardHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Όνομα Κατόχου Κάρτας</FormLabel>
                              <FormControl>
                                <Input placeholder="Γιάννης Παπαδόπουλος" data-testid="input-card-holder" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Αριθμός Κάρτας</FormLabel>
                              <FormControl>
                                <Input placeholder="1234 5678 9012 3456" data-testid="input-card-number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ημερομηνία Λήξης</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/YY" data-testid="input-card-expiry" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" data-testid="input-card-cvv" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                  data-testid="button-complete-order"
                >
                  {isSubmitting ? "Επεξεργασία..." : `Ολοκλήρωση Παραγγελίας - €${total.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Σύνοψη Παραγγελίας</CardTitle>
                <CardDescription>{cartItems.length} προϊόν(τα) στο καλάθι</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.description} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-sm">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Υποσύνολο:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Μεταφορικά:</span>
                    <span>{shipping === 0 ? "Δωρεάν" : `€${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ΦΠΑ (24%):</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  {watchPaymentMethod === "cash_on_delivery" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Χρέωση Αντικαταβολής:</span>
                      <span>€2.00</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Σύνολο:</span>
                    <span>€{(total + (watchPaymentMethod === "cash_on_delivery" ? 2 : 0)).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Πληροφορίες Παράδοσης
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Εκτιμώμενη Παράδοση:</span>
                  <span className="font-medium">3-7 εργάσιμες ημέρες</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Δωρεάν Μεταφορικά:</span>
                  <span className="font-medium">Παραγγελίες άνω των €50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Παρακολούθηση:</span>
                  <span className="font-medium">Email ενημερώσεις</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}