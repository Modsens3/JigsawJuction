import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Camera,
  RotateCw,
  Move3D,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Download,
  Share,
  Settings,
  Info,
  Smartphone,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ARPreviewProps {
  puzzleImage?: string;
  puzzleSize?: string;
  material?: string;
}

export default function ARPreview({ puzzleImage, puzzleSize = "30x22cm", material = "Ξύλο" }: ARPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [puzzleScale, setPuzzleScale] = useState([50]);
  const [puzzleRotation, setPuzzleRotation] = useState(0);
  const [puzzlePosition, setPuzzlePosition] = useState({ x: 50, y: 50 });
  const [showPuzzleOverlay, setShowPuzzleOverlay] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState<string>('landscape');
  const { toast } = useToast();

  // Initialize AR camera
  const startAR = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' }, // Rear camera preferred
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
          setIsARActive(true);
          toast({
            title: "AR Ενεργοποιήθηκε!",
            description: "Στρέψτε την κάμερα προς μια επίπεδη επιφάνεια",
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Σφάλμα Κάμερας",
        description: "Δεν μπόρεσα να προσπελάσω την κάμερα. Επιτρέψτε την πρόσβαση.",
        variant: "destructive"
      });
    }
  };

  // Stop AR camera
  const stopAR = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsARActive(false);
    setIsVideoReady(false);
  };

  // Capture AR screenshot
  const captureAR = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    setIsCapturing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set canvas size to video size
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `fractal-puzzle-ar-preview-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Φωτογραφία Αποθηκεύτηκε!",
        description: "Η AR προεπισκόπηση αποθηκεύτηκε επιτυχώς",
      });
    }
    
    setTimeout(() => setIsCapturing(false), 1000);
  };

  // Handle device orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      const orientation = window.screen.orientation?.type || 
                         (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
      setDeviceOrientation(orientation);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    handleOrientationChange();

    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAR();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              AR Προεπισκόπηση Παζλ
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Δείτε πώς θα μοιάζει το παζλ σας στον πραγματικό χώρο με επαυξημένη πραγματικότητα
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AR Viewer */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2 text-primary" />
                    AR Προβολή
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isARActive ? "default" : "secondary"}>
                      {isARActive ? "Ενεργό" : "Ανενεργό"}
                    </Badge>
                    {isARActive && (
                      <Badge variant="outline" className="text-xs">
                        {deviceOrientation}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                  {!isARActive ? (
                    // AR Start Screen
                    <div className="text-center space-y-6 p-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-10 h-10 text-primary-foreground" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">Ξεκινήστε AR Προεπισκόπηση</h3>
                        <p className="text-gray-300 max-w-md">
                          Χρησιμοποιήστε την κάμερά σας για να δείτε το παζλ στον πραγματικό χώρο
                        </p>
                      </div>
                      <div className="flex flex-col space-y-3">
                        <Button onClick={startAR} size="lg" className="bg-gradient-to-r from-primary to-secondary">
                          <Camera className="w-5 h-5 mr-2" />
                          Ενεργοποίηση AR
                        </Button>
                        <div className="text-xs text-gray-400 flex items-center justify-center">
                          <Smartphone className="w-4 h-4 mr-1" />
                          Βέλτιστο για κινητές συσκευές
                        </div>
                      </div>
                    </div>
                  ) : (
                    // AR Camera View
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      
                      {/* AR Puzzle Overlay */}
                      {isVideoReady && showPuzzleOverlay && (
                        <div 
                          className="absolute pointer-events-none"
                          style={{
                            left: `${puzzlePosition.x}%`,
                            top: `${puzzlePosition.y}%`,
                            transform: `translate(-50%, -50%) rotate(${puzzleRotation}deg) scale(${puzzleScale[0] / 100})`,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div className="relative">
                            {/* Puzzle Shadow */}
                            <div 
                              className="absolute inset-0 bg-black/20 blur-md"
                              style={{ transform: 'translate(4px, 4px)' }}
                            />
                            
                            {/* Puzzle Image */}
                            <div className="relative bg-white rounded-lg shadow-2xl border-4 border-white">
                              {puzzleImage ? (
                                <img 
                                  src={puzzleImage} 
                                  alt="AR Puzzle Preview"
                                  className="w-48 h-36 object-cover rounded"
                                />
                              ) : (
                                <div className="w-48 h-36 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center">
                                  <div className="text-center text-gray-600">
                                    <div className="text-2xl mb-1">🧩</div>
                                    <div className="text-xs">Fractal Παζλ</div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Puzzle Info Badge */}
                              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                {puzzleSize}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* AR Controls Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowPuzzleOverlay(!showPuzzleOverlay)}
                            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                          >
                            {showPuzzleOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={captureAR}
                            disabled={isCapturing}
                            className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                          >
                            {isCapturing ? (
                              <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={stopAR}
                            className="bg-red-600/80 hover:bg-red-600"
                          >
                            Τερματισμός
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Hidden canvas for capturing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AR Controls */}
          <div className="space-y-6">
            {/* Puzzle Info */}
            <Card className="glass-morphism">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Info className="w-4 h-4 mr-2 text-secondary" />
                  Πληροφορίες Παζλ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Μέγεθος:</span>
                    <Badge variant="secondary">{puzzleSize}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Υλικό:</span>
                    <Badge variant="secondary">{material}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Τύπος:</span>
                    <Badge variant="secondary">Fractal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AR Controls */}
            {isARActive && (
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Settings className="w-4 h-4 mr-2 text-primary" />
                    Ελέγχοι AR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scale Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Μέγεθος</label>
                      <span className="text-xs text-muted-foreground">{puzzleScale[0]}%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ZoomOut className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        value={puzzleScale}
                        onValueChange={setPuzzleScale}
                        max={150}
                        min={25}
                        step={5}
                        className="flex-1"
                      />
                      <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Rotation Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Περιστροφή</label>
                      <span className="text-xs text-muted-foreground">{puzzleRotation}°</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPuzzleRotation(r => r - 15)}
                      >
                        ↺
                      </Button>
                      <Slider
                        value={[puzzleRotation]}
                        onValueChange={([value]) => setPuzzleRotation(value)}
                        max={360}
                        min={0}
                        step={15}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setPuzzleRotation(r => r + 15)}
                      >
                        ↻
                      </Button>
                    </div>
                  </div>

                  {/* Position Reset */}
                  <div className="pt-3 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => {
                        setPuzzlePosition({ x: 50, y: 50 });
                        setPuzzleRotation(0);
                        setPuzzleScale([50]);
                      }}
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Επαναφορά
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AR Instructions */}
            <Card className="glass-morphism bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Οδηγίες AR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <p>Στρέψτε την κάμερα σε επίπεδη επιφάνεια</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 flex-shrink-0" />
                    <p>Χρησιμοποιήστε τα controls για προσαρμογή</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 flex-shrink-0" />
                    <p>Κάντε capture για αποθήκευση</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    <p>Καλύτερα αποτελέσματα με καλό φωτισμό</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Share Options */}
            {isARActive && (
              <Card className="glass-morphism">
                <CardContent className="p-4">
                  <Button variant="outline" className="w-full" onClick={captureAR}>
                    <Share className="w-4 h-4 mr-2" />
                    Μοιραστείτε AR Preview
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Browser Compatibility Notice */}
        {!navigator.mediaDevices && (
          <Card className="glass-morphism mt-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                    Μη Υποστηριζόμενο Πρόγραμμα Περιήγησης
                  </h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Η λειτουργία AR απαιτεί σύγχρονο browser με υποστήριξη WebRTC. 
                    Χρησιμοποιήστε Chrome, Firefox, Safari ή Edge για καλύτερη εμπειρία.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}