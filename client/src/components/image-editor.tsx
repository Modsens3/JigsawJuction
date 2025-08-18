import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Crop, 
  Download,
  Undo,
  Redo,
  Palette,
  Sliders,
  Filter,
  Scissors,
  Move3D,
  RefreshCw
} from "lucide-react";
import { ImageEditor, ImageFilter, ColorAdjustments, CropArea, ImageTransform, imageFilters } from "@/lib/image-editor";
import { cn } from "@/lib/utils";

interface ImageEditorComponentProps {
  onImageProcessed?: (imageData: string) => void;
  initialImage?: string;
  className?: string;
}

export default function ImageEditorComponent({ 
  onImageProcessed, 
  initialImage,
  className 
}: ImageEditorComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editor, setEditor] = useState<ImageEditor | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Color adjustments state
  const [colorAdjustments, setColorAdjustments] = useState<ColorAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    gamma: 1
  });
  
  // Transform state
  const [transform, setTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    flipX: false,
    flipY: false
  });
  
  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });

  useEffect(() => {
    if (canvasRef.current) {
      const newEditor = new ImageEditor(canvasRef.current);
      setEditor(newEditor);
      
      if (initialImage) {
        loadImageFromUrl(initialImage);
      }
    }
  }, [initialImage]);

  const saveToHistory = () => {
    if (!editor) return;
    
    const imageData = editor.exportImage();
    const newHistory = [...history.slice(0, historyIndex + 1), imageData];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && editor) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      loadImageFromUrl(previousState);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && editor) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      loadImageFromUrl(nextState);
    }
  };

  const loadImageFromUrl = async (url: string) => {
    if (!editor) return;
    
    try {
      await editor.loadImage(url);
      setIsImageLoaded(true);
      if (activeTab === "upload") {
        setActiveTab("colors");
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      try {
        await editor.loadImage(file);
        setIsImageLoaded(true);
        setActiveTab("colors");
        saveToHistory();
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  const handleColorAdjustment = (key: keyof ColorAdjustments, value: number) => {
    if (!editor) return;
    
    const newAdjustments = { ...colorAdjustments, [key]: value };
    setColorAdjustments(newAdjustments);
    
    editor.resetToOriginal();
    editor.applyColorAdjustments(newAdjustments);
  };

  const applyColorChanges = () => {
    saveToHistory();
    onImageProcessed?.(editor?.exportImage() || '');
  };

  const resetColorAdjustments = () => {
    if (!editor) return;
    
    const resetAdjustments: ColorAdjustments = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      gamma: 1
    };
    
    setColorAdjustments(resetAdjustments);
    editor.resetToOriginal();
  };

  const applyFilter = (filter: ImageFilter, intensity?: number) => {
    if (!editor || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      filter.apply(canvasRef.current, ctx, intensity);
      saveToHistory();
      onImageProcessed?.(editor.exportImage());
    }
  };

  const handleTransform = (key: keyof ImageTransform, value: number | boolean) => {
    if (!editor) return;
    
    const newTransform = { ...transform, [key]: value };
    setTransform(newTransform);
    editor.applyTransform(newTransform);
  };

  const applyTransformChanges = () => {
    saveToHistory();
    onImageProcessed?.(editor?.exportImage() || '');
  };

  const resetTransform = () => {
    if (!editor) return;
    
    const resetTransform: ImageTransform = {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false
    };
    
    setTransform(resetTransform);
    editor.resetToOriginal();
  };

  const applyCrop = () => {
    if (!editor) return;
    
    editor.cropImage(cropArea);
    setCropMode(false);
    saveToHistory();
    onImageProcessed?.(editor.exportImage());
  };

  const exportImage = () => {
    if (!editor) return;
    
    const imageData = editor.exportImage('png', 0.9);
    const link = document.createElement('a');
    link.download = 'edited-puzzle-image.png';
    link.href = imageData;
    link.click();
  };

  const resetToOriginal = () => {
    if (!editor) return;
    
    editor.resetToOriginal();
    setColorAdjustments({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      gamma: 1
    });
    setTransform({
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false
    });
    saveToHistory();
    onImageProcessed?.(editor.exportImage());
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Επεξεργασία Εικόνας
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            data-testid="button-undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            data-testid="button-redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={resetToOriginal}
            disabled={!isImageLoaded}
            data-testid="button-reset"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Επαναφορά
          </Button>
          <Button
            size="sm"
            onClick={exportImage}
            disabled={!isImageLoaded}
            data-testid="button-export"
          >
            <Download className="w-4 h-4 mr-2" />
            Λήψη
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Canvas Area */}
        <Card className="glass-morphism border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Προεπισκόπηση
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted/20 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              {!isImageLoaded ? (
                <div className="text-center space-y-4">
                  <Upload className="w-16 h-16 mx-auto text-muted-foreground/50" />
                  <div>
                    <p className="text-muted-foreground">Ανεβάστε μια εικόνα για να ξεκινήσετε</p>
                    <p className="text-sm text-muted-foreground/70">Υποστηριζόμενες μορφές: JPG, PNG, WEBP</p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card className="glass-morphism border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Εργαλεία Επεξεργασίας
            </CardTitle>
            <CardDescription>
              Προσαρμόστε την εικόνα σας για το τέλειο παζλ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upload" data-testid="tab-upload">
                  <Upload className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="colors" disabled={!isImageLoaded} data-testid="tab-colors">
                  <Palette className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="filters" disabled={!isImageLoaded} data-testid="tab-filters">
                  <Filter className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="transform" disabled={!isImageLoaded} data-testid="tab-transform">
                  <Move3D className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="image-upload">Ανέβασμα Εικόνας</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                    data-testid="input-image-upload"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full"
                    data-testid="button-upload-trigger"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Επιλέξτε Εικόνα
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Υποστηριζόμενες μορφές: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </TabsContent>

              {/* Color Adjustments Tab */}
              <TabsContent value="colors" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Φωτεινότητα: {colorAdjustments.brightness}</Label>
                    <Slider
                      value={[colorAdjustments.brightness]}
                      onValueChange={([value]) => handleColorAdjustment('brightness', value)}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-2"
                      data-testid="slider-brightness"
                    />
                  </div>
                  
                  <div>
                    <Label>Αντίθεση: {colorAdjustments.contrast}</Label>
                    <Slider
                      value={[colorAdjustments.contrast]}
                      onValueChange={([value]) => handleColorAdjustment('contrast', value)}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-2"
                      data-testid="slider-contrast"
                    />
                  </div>
                  
                  <div>
                    <Label>Κορεσμός: {colorAdjustments.saturation}</Label>
                    <Slider
                      value={[colorAdjustments.saturation]}
                      onValueChange={([value]) => handleColorAdjustment('saturation', value)}
                      min={-100}
                      max={100}
                      step={1}
                      className="mt-2"
                      data-testid="slider-saturation"
                    />
                  </div>
                  
                  <div>
                    <Label>Απόχρωση: {colorAdjustments.hue}°</Label>
                    <Slider
                      value={[colorAdjustments.hue]}
                      onValueChange={([value]) => handleColorAdjustment('hue', value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-2"
                      data-testid="slider-hue"
                    />
                  </div>
                  
                  <div>
                    <Label>Gamma: {colorAdjustments.gamma.toFixed(1)}</Label>
                    <Slider
                      value={[colorAdjustments.gamma]}
                      onValueChange={([value]) => handleColorAdjustment('gamma', value)}
                      min={0.1}
                      max={3.0}
                      step={0.1}
                      className="mt-2"
                      data-testid="slider-gamma"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={applyColorChanges} className="flex-1" data-testid="button-apply-colors">
                      Εφαρμογή
                    </Button>
                    <Button variant="outline" onClick={resetColorAdjustments} data-testid="button-reset-colors">
                      Επαναφορά
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Filters Tab */}
              <TabsContent value="filters" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {imageFilters.map((filter) => (
                    <Button
                      key={filter.name}
                      variant="outline"
                      onClick={() => applyFilter(filter)}
                      className="text-sm"
                      data-testid={`filter-${filter.name}`}
                    >
                      {filter.displayName}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Transform Tab */}
              <TabsContent value="transform" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Περιστροφή: {transform.rotation}°</Label>
                    <Slider
                      value={[transform.rotation]}
                      onValueChange={([value]) => handleTransform('rotation', value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="mt-2"
                      data-testid="slider-rotation"
                    />
                  </div>
                  
                  <div>
                    <Label>Κλίμακα: {transform.scale.toFixed(2)}</Label>
                    <Slider
                      value={[transform.scale]}
                      onValueChange={([value]) => handleTransform('scale', value)}
                      min={0.1}
                      max={3.0}
                      step={0.1}
                      className="mt-2"
                      data-testid="slider-scale"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={transform.flipX ? "default" : "outline"}
                      onClick={() => handleTransform('flipX', !transform.flipX)}
                      className="flex-1"
                      data-testid="button-flip-x"
                    >
                      <FlipHorizontal className="w-4 h-4 mr-2" />
                      Οριζόντια
                    </Button>
                    <Button
                      variant={transform.flipY ? "default" : "outline"}
                      onClick={() => handleTransform('flipY', !transform.flipY)}
                      className="flex-1"
                      data-testid="button-flip-y"
                    >
                      <FlipVertical className="w-4 h-4 mr-2" />
                      Κάθετα
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={applyTransformChanges} className="flex-1" data-testid="button-apply-transform">
                      Εφαρμογή
                    </Button>
                    <Button variant="outline" onClick={resetTransform} data-testid="button-reset-transform">
                      Επαναφορά
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}