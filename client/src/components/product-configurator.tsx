import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/cart-store";
import { Upload, Network, Gem, FileText, ShoppingCart, ArrowLeft } from "lucide-react";
import { calculatePrice } from "@/lib/puzzle-utils";

interface PredefinedPuzzle {
  id: string;
  name: string;
  description: string;
  type: 'round' | 'octagon' | 'square';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  pieces: number;
  imageUrl: string;
  basePrice: number;
  featured: number;
}

interface ConfigurationState {
  imageUrl: string | null;
  size: string;
  material: string;
  pieceCount: number;
  predefinedPuzzle?: PredefinedPuzzle;
}

interface ProductConfiguratorProps {
  predefinedPuzzle?: PredefinedPuzzle;
  onBack?: () => void;
}

export default function ProductConfigurator({ predefinedPuzzle, onBack }: ProductConfiguratorProps) {
  const { toast } = useToast();
  const { addToCart } = useCartStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<ConfigurationState>({
    imageUrl: predefinedPuzzle?.imageUrl || null,
    size: "30x40",
    material: "wood",
    pieceCount: predefinedPuzzle?.pieces || 500,
    predefinedPuzzle,
  });

  const [price, setPrice] = useState(predefinedPuzzle ? predefinedPuzzle.basePrice.toString() : "40.00");

  // Calculate price whenever configuration changes
  const calculatePriceMutation = useMutation({
    mutationFn: async (configuration: Partial<ConfigurationState>) => {
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configuration),
      });
      if (!response.ok) throw new Error("Σφάλμα υπολογισμού τιμής");
      return response.json();
    },
    onSuccess: (data) => {
      setPrice(data.price);
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Σφάλμα κατά το ανέβασμα");
      return response.json();
    },
    onSuccess: (data) => {
              setConfig(prev => ({ ...prev, imageUrl: data.imageUrl }));
      toast({ title: "Η εικόνα ανέβηκε επιτυχώς!" });
    },
    onError: () => {
      toast({ 
        title: "Σφάλμα", 
        description: "Δεν ήταν δυνατό το ανέβασμα της εικόνας",
        variant: "destructive" 
      });
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: config.imageUrl,
  
          size: config.size,
          material: config.material,
          pieceCount: config.pieceCount,
          quantity: 1,
          price: price,
          sessionId: localStorage.getItem("sessionId") || "anonymous",
        }),
      });
      
      if (!response.ok) throw new Error("Σφάλμα προσθήκης στο καλάθι");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      // Add the item to the cart store
      addToCart({
        id: data.id || Date.now().toString(),
        name: `Παζλ ${config.size} - ${config.material}`,
        description: `Προσαρμοσμένο παζλ με ${config.pieceCount} κομμάτια`,
        price: parseFloat(price),
        quantity: 1,
        image: config.imageUrl || "/placeholder-puzzle.jpg",
        type: "puzzle",
        customization: {
          size: config.size,
          material: config.material,
          pieceCount: config.pieceCount,
  
        }
      });
      toast({ title: "Το προϊόν προστέθηκε στο καλάθι!" });
    },
    onError: () => {
      toast({ 
        title: "Σφάλμα", 
        description: "Δεν ήταν δυνατή η προσθήκη στο καλάθι",
        variant: "destructive" 
      });
    },
  });

  const updateConfig = (updates: Partial<ConfigurationState>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    calculatePriceMutation.mutate(newConfig);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: "Σφάλμα", 
          description: "Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 10MB",
          variant: "destructive" 
        });
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  const sizeOptions = [
    { value: "30x40", label: "30x40 cm", subtitle: "Μικρό" },
    { value: "40x60", label: "40x60 cm", subtitle: "Μεσαίο" },
    { value: "60x80", label: "60x80 cm", subtitle: "Μεγάλο" },
    { value: "custom", label: "Προσαρμογή", subtitle: "Custom" },
  ];

  const materialOptions = [
    { 
      value: "wood", 
      label: "Ξύλο Premium", 
      subtitle: "Υψηλή ποιότητα, διαρκές",
      icon: Network,
      price: "+€15"
    },
    { 
      value: "acrylic", 
      label: "Ακρυλικό", 
      subtitle: "Διαφανές, μοντέρνο",
      icon: Gem,
      price: "+€10"
    },
    { 
      value: "paper", 
      label: "Χαρτί Υψηλής Ποιότητας", 
      subtitle: "Κλασικό, οικονομικό",
      icon: FileText,
      price: "Βάση"
    },
  ];

  const pieceOptions = [100, 300, 500, 1000];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Predefined Puzzle Header */}
          {predefinedPuzzle && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-900">{predefinedPuzzle.name}</h2>
                    <p className="text-blue-700">{predefinedPuzzle.description}</p>
                  </div>
                  {onBack && (
                    <Button variant="outline" onClick={onBack}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Επιστροφή
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {predefinedPuzzle.type === 'round' ? 'Στρογγυλό' : 
                     predefinedPuzzle.type === 'octagon' ? 'Οκτάγωνο' : 'Τετράγωνο'}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {predefinedPuzzle.difficulty === 'easy' ? 'Εύκολο' :
                     predefinedPuzzle.difficulty === 'medium' ? 'Μέτριο' :
                     predefinedPuzzle.difficulty === 'hard' ? 'Δύσκολο' : 'Πολύ Δύσκολο'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {predefinedPuzzle.pieces} κομμάτια
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Upload Image */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">1</span>
                Επιλέξτε Εικόνα
              </h3>
              
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-area"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Σύρετε την εικόνα εδώ ή κάντε κλικ για επιλογή</p>
                  <p className="text-sm text-gray-500">PNG, JPG μέχρι 10MB</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-file-upload"
                  />
                </div>
                
                {uploadImageMutation.isPending && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Ανέβασμα εικόνας...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Size Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">2</span>
                Μέγεθος
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {sizeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={config.size === option.value ? "default" : "outline"}
                    className={`p-3 h-auto flex flex-col ${
                      config.size === option.value
                        ? "bg-primary text-white"
                        : "hover:border-primary hover:text-primary"
                    }`}
                    onClick={() => updateConfig({ size: option.value })}
                    data-testid={`button-size-${option.value}`}
                  >
                    <div className="text-lg font-semibold">{option.label}</div>
                    <div className="text-sm opacity-80">{option.subtitle}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Material Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">3</span>
                Υλικό
              </h3>
              
              <div className="space-y-3">
                {materialOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        config.material === option.value
                          ? "border-primary bg-primary/10"
                          : "border-gray-300 hover:border-primary"
                      }`}
                      onClick={() => updateConfig({ material: option.value })}
                      data-testid={`button-material-${option.value}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconComponent 
                            className={`text-xl mr-3 ${
                              config.material === option.value ? "text-primary" : "text-gray-600"
                            }`} 
                          />
                          <div>
                            <div className={`font-semibold ${
                              config.material === option.value ? "text-primary" : "text-gray-700"
                            }`}>
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600">{option.subtitle}</div>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          config.material === option.value ? "text-primary" : "text-gray-600"
                        }`}>
                          {option.price}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Piece Count */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral mb-4 flex items-center">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">4</span>
                Αριθμός Κομματιών
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {pieceOptions.map((pieces) => (
                  <Button
                    key={pieces}
                    variant={config.pieceCount === pieces ? "default" : "outline"}
                    className={config.pieceCount === pieces ? "bg-primary text-white" : ""}
                    onClick={() => updateConfig({ pieceCount: pieces })}
                    data-testid={`button-pieces-${pieces}`}
                  >
                    {pieces}
                  </Button>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Προσαρμογή:</label>
                <Slider
                  value={[config.pieceCount]}
                  onValueChange={(value) => updateConfig({ pieceCount: value[0] })}
                  max={2000}
                  min={100}
                  step={50}
                  className="w-full"
                  data-testid="slider-piece-count"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>100</span>
                  <span className="font-semibold text-primary">{config.pieceCount}</span>
                  <span>2000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-24">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral mb-6">Προεπισκόπηση Παζλ</h3>
              
              <div className="aspect-square bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                <img 
                  src={config.imageUrl || "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"} 
                  alt="Puzzle preview" 
                  className="w-full h-full object-cover rounded-lg"
                  data-testid="img-preview"
                />
              </div>

              {/* Price Summary */}
              <Card className="bg-gray-50 mb-6">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Βασική τιμή ({config.size}, {config.pieceCount} κομμάτια):</span>
                      <span className="font-semibold">€25.00</span>
                    </div>
                    {config.material === "wood" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ξύλο Premium:</span>
                        <span className="font-semibold">€15.00</span>
                      </div>
                    )}
                    {config.material === "acrylic" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ακρυλικό:</span>
                        <span className="font-semibold">€10.00</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Σύνολο:</span>
                      <span className="text-primary" data-testid="text-total-price">€{price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add to Cart */}
              <Button 
                className="w-full bg-accent text-white hover:bg-accent/90 mb-4"
                size="lg"
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending || !config.imageUrl}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Προσθήκη στο Καλάθι
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8.5h.01M10 17h4" />
                </svg>
                Δωρεάν μεταφορικά για παραγγελίες άνω των €50
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
