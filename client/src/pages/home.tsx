import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Zap, Layers, Upload, Palette, Cpu, Truck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen fractal-bg">
      {/* Fractal decorative elements */}
      <div className="fractal-shape w-32 h-32 top-20 left-10 opacity-30"></div>
      <div className="fractal-shape w-24 h-24 top-40 right-20 opacity-20"></div>
      <div className="fractal-shape w-16 h-16 bottom-40 left-1/4 opacity-25"></div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="fractal-glow w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-primary font-medium">Τεχνολογία Fractal</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Φράκταλ Παζλ
                  </span>
                  <br />
                  <span className="text-neutral">
                    Νέας Γενιάς
                  </span>
                </h1>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Ανακαλύψτε τη μαγεία των μαθηματικών fractal σε μοναδικά παζλ. 
                Δημιουργήστε απείρως πολύπλοκα σχέδια με αλγόριθμους που παράγουν 
                εκπληκτικά γεωμετρικά μοτίβα.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/fractal-generator">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-4 text-lg fractal-glow"
                    data-testid="button-create-fractal"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Δημιουργία Fractal
                  </Button>
                </Link>
                <Link href="/fractal-generator">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg glass-morphism"
                    data-testid="button-upload-photo"
                  >
                    <Layers className="w-5 h-5 mr-2" />
                    Ανέβασμα Φωτό
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="fractal-element">
                <div className="relative w-full h-96 rounded-3xl overflow-hidden glass-morphism border border-primary/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10"></div>
                  <div className="absolute inset-4 flex items-center justify-center">
                    <svg className="w-full h-full animated-fractal" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                      {/* Animated Fractal Puzzle Pattern */}
                      <defs>
                        <linearGradient id="animatedGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(280, 85%, 65%)" stopOpacity="0.8">
                            <animate attributeName="stop-color" values="hsl(280, 85%, 65%);hsl(320, 75%, 55%);hsl(200, 90%, 55%);hsl(280, 85%, 65%)" dur="6s" repeatCount="indefinite" />
                          </stop>
                          <stop offset="50%" stopColor="hsl(320, 75%, 55%)" stopOpacity="0.9">
                            <animate attributeName="stop-color" values="hsl(320, 75%, 55%);hsl(200, 90%, 55%);hsl(280, 85%, 65%);hsl(320, 75%, 55%)" dur="6s" repeatCount="indefinite" />
                          </stop>
                          <stop offset="100%" stopColor="hsl(200, 90%, 55%)" stopOpacity="0.7">
                            <animate attributeName="stop-color" values="hsl(200, 90%, 55%);hsl(280, 85%, 65%);hsl(320, 75%, 55%);hsl(200, 90%, 55%)" dur="6s" repeatCount="indefinite" />
                          </stop>
                        </linearGradient>
                        
                        <linearGradient id="animatedGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(320, 75%, 55%)" stopOpacity="0.6">
                            <animate attributeName="stop-color" values="hsl(320, 75%, 55%);hsl(280, 85%, 65%);hsl(200, 90%, 55%);hsl(320, 75%, 55%)" dur="8s" repeatCount="indefinite" />
                          </stop>
                          <stop offset="100%" stopColor="hsl(200, 90%, 55%)" stopOpacity="0.8">
                            <animate attributeName="stop-color" values="hsl(200, 90%, 55%);hsl(320, 75%, 55%);hsl(280, 85%, 65%);hsl(200, 90%, 55%)" dur="8s" repeatCount="indefinite" />
                          </stop>
                        </linearGradient>
                      </defs>
                      
                      {/* Animated Puzzle Pieces */}
                      <g className="puzzle-group-1">
                        <path
                          d="M80,80 L 100 60 L 120 40 L 140 60 L 160 80 L 180 100 L 200 120 L 220 100 L 240 80 L 260 60 L 280 40 L 300 60 L 320 80 L 300 100 L 280 120 L 260 100 L 240 120 L 220 140 L 200 160 L 180 140 L 160 120 L 140 100 L 120 120 L 100 100 L 80 80 Z"
                          fill="url(#animatedGrad1)"
                          stroke="hsl(var(--primary))"
                          strokeWidth="1.5"
                          opacity="0.7"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 200 200;360 200 200"
                            dur="20s"
                            repeatCount="indefinite"
                          />
                        </path>
                        
                        <path
                          d="M50,150 L 70 130 L 90 110 L 110 130 L 130 150 L 150 170 L 170 190 L 190 170 L 210 150 L 230 130 L 250 110 L 270 130 L 290 150 L 270 170 L 250 190 L 230 170 L 210 190 L 190 210 L 170 230 L 150 210 L 130 190 L 110 170 L 90 190 L 70 170 L 50 150 Z"
                          fill="url(#animatedGrad2)"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="1.5"
                          opacity="0.6"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="360 200 200;0 200 200"
                            dur="15s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </g>
                      
                      <g className="puzzle-group-2">
                        <path
                          d="M120,250 L 140 230 L 160 210 L 180 230 L 200 250 L 220 270 L 240 290 L 260 270 L 280 250 L 300 230 L 320 210 L 340 230 L 360 250 L 340 270 L 320 290 L 300 270 L 280 290 L 260 310 L 240 330 L 220 310 L 200 290 L 180 270 L 160 290 L 140 270 L 120 250 Z"
                          fill="url(#animatedGrad1)"
                          stroke="hsl(var(--accent))"
                          strokeWidth="1.5"
                          opacity="0.5"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 200 200;-360 200 200"
                            dur="25s"
                            repeatCount="indefinite"
                          />
                        </path>
                        
                        <circle cx="200" cy="200" r="15" fill="url(#animatedGrad2)" opacity="0.8">
                          <animate attributeName="r" values="15;25;15" dur="4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="4s" repeatCount="indefinite" />
                        </circle>
                      </g>
                      
                      {/* Floating puzzle pieces */}
                      {Array.from({ length: 6 }, (_, i) => (
                        <g key={i}>
                          <path
                            d={`M${50 + i * 60},${50 + i * 10} L ${70 + i * 60} ${40 + i * 10} L ${90 + i * 60} ${60 + i * 10} L ${70 + i * 60} ${80 + i * 10} L ${50 + i * 60} ${60 + i * 10} Z`}
                            fill="url(#animatedGrad1)"
                            opacity="0.4"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="translate"
                              values={`0,0;${10 - i * 2},${-5 + i};0,0`}
                              dur={`${3 + i}s`}
                              repeatCount="indefinite"
                            />
                          </path>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Fractal Puzzles Work */}
      <section className="py-20 relative overflow-hidden">
        <div className="fractal-shape w-40 h-40 top-10 right-10 opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral mb-4">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Fractal Μαγεία
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">Τεχνολογία αιχμής για μοναδικά γεωμετρικά παζλ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl fractal-glow flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-neutral mb-3">1. Αλγόριθμος Fractal</h3>
              <p className="text-muted-foreground">Εξελιγμένοι μαθηματικοί αλγόριθμοι δημιουργούν μοναδικά γεωμετρικά μοτίβα</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl fractal-glow flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-neutral mb-3">2. Δημιουργία</h3>
              <p className="text-muted-foreground">Παραγωγή υψηλής ανάλυσης σε ξύλο, ακρυλικό ή premium χαρτί</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl fractal-glow flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-neutral mb-3">3. Παράδοση</h3>
              <p className="text-muted-foreground">Ασφαλής συσκευασία και γρήγορη παράδοση σε όλη την Ελλάδα</p>
            </div>
          </div>
        </div>
      </section>
      {/* Fractal Features */}
      <section className="py-20 relative overflow-hidden">
        <div className="fractal-shape w-40 h-40 top-10 right-10 opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="glass-morphism border border-primary/20 shadow-2xl">
            <CardContent className="p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <h2 className="text-4xl font-bold text-neutral mb-6">
                    Γιατί <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">FractalCraft</span>?
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="fractal-glow w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral text-lg mb-2">Μοναδικότητα</h3>
                        <p className="text-muted-foreground">Κάθε fractal είναι μαθηματικά μοναδικό - δεν υπάρχουν δύο ίδια</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start group">
                      <div className="fractal-glow w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        
                        <p className="text-muted-foreground">Ξύλο, ακρυλικό και χαρτί museum-quality για διαρκή αποτελέσματα</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="fractal-element">
                    <div className="relative w-full h-80 rounded-3xl overflow-hidden glass-morphism border border-primary/30">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"></div>
                      <div className="absolute inset-4 flex items-center justify-center">
                        <svg className="w-full h-full fractal-pulse" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <radialGradient id="fractalRadial" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="hsl(280, 85%, 65%)" />
                              <stop offset="50%" stopColor="hsl(320, 75%, 55%)" />
                              <stop offset="100%" stopColor="hsl(200, 90%, 55%)" />
                            </radialGradient>
                          </defs>
                          
                          <g transform="translate(150,150)">
                            {/* Spiral fractal pattern */}
                            {Array.from({ length: 12 }, (_, i) => (
                              <g key={i} transform={`rotate(${i * 30}) scale(${1 - i * 0.08})`}>
                                <path
                                  d="M0,0 Q30,20 60,0 Q30,-20 0,0 Q-30,20 -60,0 Q-30,-20 0,0"
                                  fill="none"
                                  stroke="url(#fractalRadial)"
                                  strokeWidth="2"
                                  opacity={0.8 - i * 0.05}
                                />
                                <circle cx="30" cy="0" r="4" fill="url(#fractalRadial)" opacity={0.7 - i * 0.04} />
                                <circle cx="-30" cy="0" r="4" fill="url(#fractalRadial)" opacity={0.7 - i * 0.04} />
                              </g>
                            ))}
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="fractal-shape w-20 h-20 top-20 left-20 opacity-30"></div>
        <div className="fractal-shape w-32 h-32 bottom-20 right-20 opacity-25"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Ξεκινήστε Τώρα
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Δημιουργήστε το δικό σας μοναδικό fractal παζλ και ανακαλύψτε τη μαγεία 
              των μαθηματικών μοτίβων σε κάθε κομμάτι.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/fractal-generator">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-12 py-6 text-xl fractal-glow"
                  data-testid="button-start-creating"
                >
                  <Sparkles className="w-6 h-6 mr-3" />
                  Δημιουργία Fractal
                </Button>
              </Link>
              <Link href="/puzzle-generator">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-primary/30 text-primary hover:bg-primary/10 px-12 py-6 text-xl glass-morphism"
                  data-testid="button-upload-puzzle"
                >
                  <Upload className="w-6 h-6 mr-3" />
                  Ανέβασμα Φωτό
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
