import { Link } from "wouter";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";
import ShoppingCartComponent from "./shopping-cart";
import { useState } from "react";

export default function Navbar() {
  const { cartCount } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">PuzzleCraft</h1>
            </Link>
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <Link href="/configurator" data-testid="link-configurator">
                <span className="text-neutral hover:text-primary transition-colors cursor-pointer">Δημιουργία</span>
              </Link>
  
              <a href="#materials" className="text-neutral hover:text-primary transition-colors" data-testid="link-materials">Υλικά</a>
              <a href="#about" className="text-neutral hover:text-primary transition-colors" data-testid="link-about">Σχετικά</a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsCartOpen(true)}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent"
                  data-testid="text-cart-count"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link href="/configurator" data-testid="link-mobile-configurator">
                    <a className="text-neutral hover:text-primary transition-colors">Δημιουργία</a>
                  </Link>
      
                  <a href="#materials" className="text-neutral hover:text-primary transition-colors">Υλικά</a>
                  <a href="#about" className="text-neutral hover:text-primary transition-colors">Σχετικά</a>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <ShoppingCartComponent 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  );
}
