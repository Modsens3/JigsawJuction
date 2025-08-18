import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Save, Sparkles } from "lucide-react";
import { Link } from "wouter";
import ImageEditorComponent from "@/components/image-editor";
import { useToast } from "@/hooks/use-toast";

export default function ImageEditorPage() {
  const [processedImage, setProcessedImage] = useState<string>("");
  const { toast } = useToast();

  const handleImageProcessed = (imageData: string) => {
    setProcessedImage(imageData);
  };

  const handleShare = () => {
    if (navigator.share && processedImage) {
      navigator.share({
        title: 'Η επεξεργασμένη μου εικόνα από FractalCraft',
        text: 'Δείτε την εικόνα που επεξεργάστηκα για το παζλ μου!',
        url: processedImage
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(processedImage);
      toast({
        title: "Αντιγράφηκε",
        description: "Ο σύνδεσμος της εικόνας αντιγράφηκε στο πρόχειρο",
      });
    }
  };

  const handleSaveToLibrary = () => {
    // In a real app, this would save to user's library
    toast({
      title: "Αποθηκεύτηκε",
      description: "Η εικόνα αποθηκεύτηκε στη βιβλιοθήκη σας",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/fractal-generator">
              <Button variant="outline" size="sm" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Πίσω στη Γενήτρια Fractal
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Επεξεργαστής Εικόνας
              </h1>
              <p className="text-muted-foreground mt-1">
                Προσαρμόστε την εικόνα σας πριν τη μετατρέψετε σε παζλ
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {processedImage && (
              <>
                <Button variant="outline" onClick={handleShare} data-testid="button-share">
                  <Share2 className="w-4 h-4 mr-2" />
                  Κοινοποίηση
                </Button>
                <Button onClick={handleSaveToLibrary} data-testid="button-save">
                  <Save className="w-4 h-4 mr-2" />
                  Αποθήκευση
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-morphism border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Έξυπνα Φίλτρα</h3>
              <p className="text-sm text-muted-foreground">Προτεινόμενα φίλτρα για παζλ</p>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                <Save className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Ιστορικό Αλλαγών</h3>
              <p className="text-sm text-muted-foreground">Undo/Redo υποστήριξη</p>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Άμεση Κοινοποίηση</h3>
              <p className="text-sm text-muted-foreground">Μοιραστείτε τη δημιουργία σας</p>
            </CardContent>
          </Card>
          
          <Card className="glass-morphism border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                <ArrowLeft className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Seamless Integration</h3>
              <p className="text-sm text-muted-foreground">Άμεση μετάβαση στη γενήτρια</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <ImageEditorComponent 
          onImageProcessed={handleImageProcessed}
          className="mb-8"
        />

        {/* Tips & Recommendations */}
        <Card className="glass-morphism border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Συμβουλές για Καλύτερα Παζλ
            </CardTitle>
            <CardDescription>
              Προτάσεις για βελτιστοποίηση της εικόνας σας
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Χρώματα & Αντίθεση</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Αυξήστε την αντίθεση για πιο ευκρινή κομμάτια παζλ</li>
                  <li>• Χρησιμοποιήστε ζωντανά χρώματα για ευκολότερη συναρμολόγηση</li>
                  <li>• Αποφύγετε υπερβολικό κορεσμό που μπορεί να κουράσει τα μάτια</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Λεπτομέρειες & Φίλτρα</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Η όξυνση βοηθά στον διαχωρισμό των κομματιών</li>
                  <li>• Αποφύγετε το θόλωμα εκτός αν θέλετε χαλαρωτικό παζλ</li>
                  <li>• Τα φίλτρα άκρων μπορούν να δημιουργήσουν ενδιαφέρον εφέ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        {processedImage && (
          <Card className="glass-morphism border-primary/20 mt-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="text-primary border-primary/20">
                    Εικόνα Έτοιμη
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">Η εικόνα σας είναι έτοιμη!</h3>
                <p className="text-muted-foreground">
                  Συνεχίστε στη γενήτρια fractal για να δημιουργήσετε το παζλ σας
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/fractal-generator">
                    <Button data-testid="button-continue-puzzle">
                      Συνέχεια στη Γενήτρια Fractal
                    </Button>
                  </Link>
                  <Link href="/configurator">
                    <Button variant="outline" data-testid="button-advanced-config">
                      Προχωρημένες Ρυθμίσεις
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}