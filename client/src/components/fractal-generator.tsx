import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Upload, Settings, ShoppingCart, X, Zap, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/cart-store";

interface UploadedImage {
  file: File;
  preview: string;
}

interface PuzzleConfig {
  size: string;
  material: string;
  pieceCount: number;
}

interface GeneratorSettings {
  seed: number;
  ncols: number;
  nrows: number;
  radius: number;
  arcShape: number;
  useRandomSeed: boolean;
  minPieceSize: number;
  maxPieceSize: number;
}

export default function FractalGeneratorComponent() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [puzzleConfig, setPuzzleConfig] = useState<PuzzleConfig>({
    size: "30x40",
    material: "wood",
    pieceCount: 500
  });
  const [generatorSettings, setGeneratorSettings] = useState<GeneratorSettings>({
    seed: 123,
    ncols: 20,
    nrows: 15,
    radius: 6.0,
    arcShape: 0, // 0=circle, 1=square, 2=octagon
    useRandomSeed: false,
    minPieceSize: 1,
    maxPieceSize: 3
  });
  const [svgOutput, setSvgOutput] = useState<string>('');
  const [svgLaser, setSvgLaser] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSVG, setIsGeneratingSVG] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'generate' | 'configure'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addItem } = useCartStore();

  // Helper function to convert File to base64 data URL
  const convertBlobToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε μια έγκυρη εικόνα",
        variant: "destructive"
      });
      return;
    }

    // Convert file to base64 data URL for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setUploadedImage({ file, preview });
    };
    reader.readAsDataURL(file);
    setCurrentStep('generate');
    
    toast({
      title: "Επιτυχία!",
      description: "Η εικόνα σας ανέβηκε επιτυχώς. Τώρα δημιουργήστε το παζλ!"
    });
  }, [toast]);

  const generatePuzzle = useCallback(async () => {
    if (!uploadedImage) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ ανεβάστε πρώτα μια εικόνα",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsGeneratingSVG(true);
    
    try {
      const { CircleFractalJigsaw } = await import("@/lib/fractal-generator");
      const { seed, ncols, nrows, arcShape, minPieceSize, maxPieceSize } = generatorSettings;
      
      // Create puzzle generator with your exact algorithm
      const jig = new CircleFractalJigsaw(ncols, nrows, minPieceSize, maxPieceSize);
      jig.setSeed(seed);
      
      // Generate the puzzle using your algorithm
      console.log('Starting generation...');
      jig.generate();
      console.log('After generate(), pieces:', jig.getPieceCount());
      
      let fillIterations = 0;
      while (jig.fillholes(false) && fillIterations < 10) {
        fillIterations++;
        console.log(`Fillholes iteration ${fillIterations}, pieces:`, jig.getPieceCount());
      }
      jig.fillholes(true); // Final pass with partials allowed
      console.log('Final piece count after fillholes:', jig.getPieceCount());
      
      // Export SVG using your algorithm
      const frame = 10;
      const crad = 15;
      const svgData = jig.exportSVG(frame, crad, arcShape);
      
      // Generate laser cutting SVG (without frame and background)
      const laserFrame = 0; // No frame for laser cutting
      const svgLaser = jig.exportSVGSinglePath(laserFrame, crad, arcShape);
      
      console.log('Laser SVG length:', svgLaser.length);
      console.log('Laser SVG preview:', svgLaser.substring(0, 200));
      
      console.log('Generator settings:', { seed, ncols, nrows, arcShape });
      console.log('Generated pieces:', jig.getPieceCount());
      console.log('SVG data length:', svgData.length);
      console.log('Full SVG:', svgData);
      
      // Test if multipaths returns actual data
      const paths = jig.multipaths(frame, crad, arcShape);
      console.log('Number of paths:', paths.length);
      console.log('First path sample:', paths[0]?.substring(0, 100));
      
      const width = ncols * 2 * crad + 2 * frame;
      const height = nrows * 2 * crad + 2 * frame;
      
      // Combine the generated SVG with the background image
      const svgContent = `
        <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; max-height: 100%; object-fit: contain;">
          <defs>
            <pattern id="imagePattern" patternUnits="userSpaceOnUse" width="${width}" height="${height}">
              <image href="${uploadedImage.preview}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
            </pattern>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#imagePattern)"/>
          ${svgData.replace(/^.*?<svg[^>]*>(.*)<\/svg>$/, '$1')}
        </svg>
      `;
      
      setSvgOutput(svgContent);
      setSvgLaser(svgLaser);
      setCurrentStep('configure');
      
      const pieceCount = jig.getPieceCount();
      const difficulty = pieceCount > 200 ? "Πολύ δύσκολο" : pieceCount > 120 ? "Δύσκολο" : pieceCount > 80 ? "Μεσαίο" : "Εύκολο";
      
      // Create celebration effect
      const celebrationToast = document.createElement('div');
      celebrationToast.className = 'celebration-toast';
      celebrationToast.innerHTML = `
        <div class="celebration-content">
          <div class="confetti-container">
            ${Array.from({ length: 20 }, (_, i) => `
              <div class="confetti confetti-${i % 6}" style="--delay: ${i * 0.1}s; --x: ${Math.random() * 100}%; --rotation: ${Math.random() * 360}deg;"></div>
            `).join('')}
          </div>
          <div class="celebration-message">
            <div class="celebration-title">🎉 ΦΑΝΤΑΣΤΙΚΟ! 🎉</div>
            <div class="celebration-description">
              Το παζλ δημιουργήθηκε με ${pieceCount} κομμάτια!
              <br><span class="difficulty-badge">${difficulty}</span>
            </div>
            <div class="ribbons">
              <div class="ribbon ribbon-left"></div>
              <div class="ribbon ribbon-right"></div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(celebrationToast);
      
      // Remove after animation
      setTimeout(() => {
        if (celebrationToast.parentNode) {
          celebrationToast.parentNode.removeChild(celebrationToast);
        }
      }, 4000);
      
      // Also show regular toast for consistency
      toast({
        title: "Επιτυχία!",
        description: `Το παζλ δημιουργήθηκε με ${pieceCount} κομμάτια! (${difficulty})`
      });
      
    } catch (error) {
      console.error('Error generating puzzle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('Error details:', errorMessage, errorStack);
      toast({
        title: "Σφάλμα",
        description: `Σφάλμα κατά τη δημιουργία του παζλ: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setIsGeneratingSVG(false);
    }
  }, [uploadedImage, generatorSettings, toast]);

  const calculatePrice = () => {
    const basePrice = 25;
    const materialMultiplier = {
      'paper': 1,
      'wood': 1.4,
      'acrylic': 1.8
    }[puzzleConfig.material] || 1;
    
    const sizeMultiplier = {
      '20x30': 1,
      '30x40': 1.4,
      '40x60': 1.8,
      '60x80': 2.6
    }[puzzleConfig.size] || 1;
    
    // Calculate piece count based on generator settings
    const pieceCount = generatorSettings.ncols * generatorSettings.nrows;
    
    // Add complexity multiplier based on piece count
    const complexityMultiplier = pieceCount <= 150 ? 1 : 
                                pieceCount <= 300 ? 1.1 : 
                                pieceCount <= 500 ? 1.2 : 1.3;
    
    return (basePrice * materialMultiplier * sizeMultiplier * complexityMultiplier).toFixed(2);
  };

  const addToCart = async () => {
    if (!uploadedImage || !svgOutput) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ δημιουργήστε πρώτα το παζλ σας",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert blob URL to base64 data URL
      const imageDataUrl = await convertBlobToDataURL(uploadedImage.file);
      
      const pieceCount = generatorSettings.ncols * generatorSettings.nrows;
      const materialName = puzzleConfig.material === "wood" ? "Ξύλο" : 
                          puzzleConfig.material === "acrylic" ? "Ακρυλικό" : "Χαρτόνι";

      const cartItem = {
        id: `fractal-${Date.now()}`,
        name: `Προσωποποιημένο Fractal Παζλ`,
        description: `${puzzleConfig.size} • ${materialName} • ${pieceCount} κομμάτια`,
        price: parseFloat(calculatePrice()),
        quantity: 1,
        image: imageDataUrl, // Use base64 data URL instead of blob URL
        customerImage: imageDataUrl, // Also store as customerImage
        type: 'custom',
        customization: {
          size: puzzleConfig.size,
          material: puzzleConfig.material,
          pieceCount: pieceCount,
          generatorSettings: generatorSettings,
          svgOutput: svgOutput,      // Preview SVG (with image)
          svgData: svgLaser,         // Laser cutting SVG (paths only)
          svgPreview: svgOutput,     // Backup for preview
          svgLaser: svgLaser         // Backup for laser cutting
        }
      };

          addItem(cartItem);
      
      toast({
        title: "Επιτυχία!",
        description: `Το προσωποποιημένο παζλ προστέθηκε στο καλάθι σας`,
      });
    } catch (error) {
      console.error('Error converting image:', error);
      toast({
        title: "Σφάλμα",
        description: "Πρόβλημα κατά τη μετατροπή της εικόνας",
        variant: "destructive"
      });
    }
  };

  const resetGenerator = () => {
    setUploadedImage(null);
    setSvgOutput('');
    setSvgLaser('');
    setCurrentStep('upload');
  };

  return (
    <div className="min-h-screen fractal-bg py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-900 bg-white/95 px-6 py-3 rounded-xl shadow-lg">
            Δημιουργός Fractal Παζλ
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed text-gray-800 bg-white/90 px-4 py-2 rounded-lg shadow-md">
            Ανεβάστε τη φωτογραφία σας, χρησιμοποιήστε τη γεννήτρια και δείτε την προεπισκόπηση με τις κοπές του παζλ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Step 1: Image Upload */}
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
              <CardHeader className="bg-gray-50/80">
                <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Βήμα 1: Ανέβασμα Εικόνας
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    data-testid="upload-area"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-bold mb-2 text-gray-900">Κάντε κλικ ή σύρετε την εικόνα σας</p>
                    <p className="text-sm font-semibold text-gray-700">
                      Υποστηριζόμενες μορφές: JPG, PNG, WEBP
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedImage.preview}
                      alt="Uploaded"
                      className="w-full h-48 object-cover rounded-lg"
                      data-testid="img-uploaded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={resetGenerator}
                      data-testid="button-reset"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="file-input"
                />
              </CardContent>
            </Card>

            {/* Step 2: Puzzle Generator */}
            {currentStep === 'generate' && uploadedImage && (
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-blue-50/80">
                  <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Βήμα 2: Γεννήτρια Παζλ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="seed" className="text-gray-900 font-bold text-base">Σπόρος (Seed)</Label>
                        <div className="group relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center cursor-help">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Αλλάζει τη μορφή και το σχήμα των κομματιών
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <Input
                        id="seed"
                        type="number"
                        value={generatorSettings.seed}
                        onChange={(e) => setGeneratorSettings(prev => ({ ...prev, seed: parseInt(e.target.value) || 1 }))}
                        data-testid="input-seed"
                        className="text-lg font-bold bg-white border-2 border-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-gray-900 font-bold text-base">Μέγεθος Παζλ</Label>
                        <div className="group relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center cursor-help">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Καθορίζει τη δυσκολία και τη λεπτομέρεια του παζλ
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <RadioGroup
                        value={`${generatorSettings.ncols}x${generatorSettings.nrows}`}
                        onValueChange={(value) => {
                          const [cols, rows] = value.split('x').map(Number);
                          setGeneratorSettings(prev => ({ ...prev, ncols: cols, nrows: rows }));
                        }}
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="15x10" id="small" />
                          <Label htmlFor="small" className="text-gray-900 font-semibold">Μικρό (15×10)</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="20x15" id="medium" />
                          <Label htmlFor="medium" className="text-gray-900 font-semibold">Μεσαίο (20×15)</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="25x20" id="large" />
                          <Label htmlFor="large" className="text-gray-900 font-semibold">Μεγάλο (25×20)</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="30x25" id="xlarge" />
                          <Label htmlFor="xlarge" className="text-gray-900 font-semibold">Πολύ Μεγάλο (30×25)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-gray-900 font-bold text-base">Σχήμα Κομματιών</Label>
                        <div className="group relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center cursor-help">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Επιλέγει το βασικό σχήμα για τα κομμάτια του παζλ
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <RadioGroup
                        value={generatorSettings.arcShape.toString()}
                        onValueChange={(value) => setGeneratorSettings(prev => ({ ...prev, arcShape: parseInt(value) }))}
                        className="grid grid-cols-3 gap-2 mt-2"
                      >
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="0" id="circle" />
                          <Label htmlFor="circle" className="text-gray-900 font-semibold">Κύκλος</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="1" id="square" />
                          <Label htmlFor="square" className="text-gray-900 font-semibold">Τετράγωνο</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="2" id="octagon" />
                          <Label htmlFor="octagon" className="text-gray-900 font-semibold">Οκτάγωνο</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-gray-900 font-bold text-base">Βαθμός Δυσκολίας</Label>
                        <div className="group relative">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center cursor-help">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Καθορίζει πόσο περίπλοκες θα είναι οι κοπές των κομματιών
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <RadioGroup
                        value={`${generatorSettings.minPieceSize}-${generatorSettings.maxPieceSize}`}
                        onValueChange={(value) => {
                          const [min, max] = value.split('-').map(Number);
                          setGeneratorSettings(prev => ({ ...prev, minPieceSize: min, maxPieceSize: max }));
                        }}
                        className="grid grid-cols-1 gap-2 mt-2"
                      >
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="1-2" id="veryhard" />
                          <Label htmlFor="veryhard" className="cursor-pointer text-gray-900 font-semibold">
                            Πολύ δύσκολο
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="1-3" id="hard" />
                          <Label htmlFor="hard" className="cursor-pointer text-gray-900 font-semibold">
                            Δύσκολο
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="2-4" id="medium" />
                          <Label htmlFor="medium" className="cursor-pointer text-gray-900 font-semibold">
                            Μεσαίο
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="3-6" id="easy" />
                          <Label htmlFor="easy" className="cursor-pointer text-gray-900 font-semibold">
                            Εύκολο
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                          <RadioGroupItem value="4-8" id="veryeasy" />
                          <Label htmlFor="veryeasy" className="cursor-pointer text-gray-900 font-semibold">
                            Πολύ εύκολο
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <Button 
                    onClick={generatePuzzle}
                    disabled={isGenerating || isGeneratingSVG}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    data-testid="button-generate-puzzle"
                  >
                    {isGenerating || isGeneratingSVG ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Δημιουργία...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Δημιουργία Παζλ
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Configuration */}
            {currentStep === 'configure' && svgOutput && (
              <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
                <CardHeader className="bg-green-50/80">
                  <CardTitle className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                    <Settings className="w-5 h-5 text-green-600" />
                    Βήμα 3: Διαμόρφωση
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-900 font-bold text-base">Μέγεθος</Label>
                      <RadioGroup
                        value={puzzleConfig.size}
                        onValueChange={(value) => setPuzzleConfig(prev => ({ ...prev, size: value }))}
                        className="grid grid-cols-1 gap-2 mt-2"
                      >
                        {[
                          { value: "20x30", label: "20x30cm", price: "€25" },
                          { value: "30x40", label: "30x40cm", price: "€35" },
                          { value: "40x60", label: "40x60cm", price: "€45" },
                          { value: "60x80", label: "60x80cm", price: "€65" }
                        ].map((size) => (
                          <div key={size.value} className="flex items-center space-x-2 p-3 bg-white rounded-lg border-2 border-gray-200">
                            <RadioGroupItem value={size.value} id={size.value} />
                            <Label htmlFor={size.value} className="flex-1 cursor-pointer">
                              <span className="text-gray-900 font-bold">{size.label}</span>
                              <Badge variant="secondary" className="ml-2 text-gray-900 bg-yellow-100 font-bold">{size.price}</Badge>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-gray-900 font-bold text-base">Υλικό</Label>
                      <RadioGroup
                        value={puzzleConfig.material}
                        onValueChange={(value) => setPuzzleConfig(prev => ({ ...prev, material: value }))}
                        className="grid grid-cols-1 gap-2 mt-2"
                      >
                        {[
                          { value: "paper", label: "Χαρτόνι", extra: "Βασική επιλογή" },
                          { value: "wood", label: "Ξύλο", extra: "Premium +40%" },
                          { value: "acrylic", label: "Ακρυλικό", extra: "Deluxe +80%" }
                        ].map((material) => (
                          <div key={material.value} className="flex items-center space-x-2 p-3 bg-white rounded-lg border-2 border-gray-200">
                            <RadioGroupItem value={material.value} id={material.value} />
                            <Label htmlFor={material.value} className="flex-1 cursor-pointer">
                              <span className="text-gray-900 font-bold">{material.label}</span>
                              <span className="text-gray-600 text-sm ml-2 font-semibold">{material.extra}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>


                  </div>

                  <Separator />
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">€{calculatePrice()}</div>
                      <div className="text-sm text-gray-700 font-semibold">
                        {puzzleConfig.size} • {puzzleConfig.material === "wood" ? "Ξύλο" : puzzleConfig.material === "acrylic" ? "Ακρυλικό" : "Χαρτόνι"}
                      </div>
                    </div>
                    <Button 
                      size="lg"
                      onClick={addToCart}
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      data-testid="add-to-cart"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Στο Καλάθι
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card className="glass-morphism border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Προεπισκόπηση Παζλ</CardTitle>
                <div className="flex gap-2">
                  {currentStep === 'configure' && svgOutput && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSvgOutput('');
                        setCurrentStep('generate');
                      }}
                      className="text-xs"
                      data-testid="button-change-settings"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Αλλαγή Ρυθμίσεων
                    </Button>
                  )}
                  {uploadedImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedImage(null);
                        setSvgOutput('');
                        setCurrentStep('upload');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-xs"
                      data-testid="button-change-image"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Αλλαγή Εικόνας
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!uploadedImage ? (
                  <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Ανεβάστε μια εικόνα για προεπισκόπηση</p>
                  </div>
                ) : currentStep === 'generate' ? (
                  <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <img
                        src={uploadedImage.preview}
                        alt="Original"
                        className="w-full max-w-64 mx-auto rounded-lg mb-4"
                      />
                      <p className="text-muted-foreground">Πατήστε "Δημιουργία Παζλ" για να δείτε τις κοπές</p>
                    </div>
                  </div>
                ) : svgOutput ? (
                  <div className="aspect-square text-[#000000]">
                    <div 
                      dangerouslySetInnerHTML={{ __html: svgOutput }} 
                      className="w-full h-full flex items-center justify-center overflow-hidden" 
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Δημιουργήστε το παζλ για προεπισκόπηση</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}