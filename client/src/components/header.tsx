import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingCart, Menu, X, User, Search, Package, LogOut, Settings, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { items } = useCartStore();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Debug log
  console.log('Header Debug:', { user, isAuthenticated, isLoading });

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const navigation = [
    { name: "Αρχική", href: "/", current: location === "/" },
    { name: "Fractal Generator", href: "/fractal-generator", current: location === "/fractal-generator" },
    { name: "Παρακολούθηση Παραγγελίας", href: "/order-tracking", current: location === "/order-tracking" },
    { name: "Blog", href: "/blog", current: location === "/blog" },
    { name: "Επικοινωνία", href: "/contact", current: location === "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  FractalCraft
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  Μοναδικά Fractal Παζλ
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                    item.current
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button>

            {/* Shopping Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative" data-testid="button-cart">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Authentication Section - Dynamic based on login state */}
            {isLoading ? (
              <div className="hidden sm:flex items-center">
                <div className="w-6 h-6 rounded-full bg-muted animate-pulse"></div>
                <div className="w-16 h-4 bg-muted animate-pulse rounded ml-2"></div>
              </div>
            ) : isAuthenticated && user ? (
              <div className="hidden sm:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" data-testid="button-user-menu">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.profileImage || ''} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                          {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium">{user.firstName || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.firstName || ''} {user.lastName || ''}</p>
                        <p className="text-xs text-muted-foreground">{user.email || ''}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Ο Λογαριασμός μου
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="w-full cursor-pointer">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Οι Παραγγελίες μου
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2" />
                      Αποσύνδεση
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" data-testid="button-login">
                    <User className="w-4 h-4 mr-2" />
                    Σύνδεση
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" data-testid="button-signup">
                    Εγγραφή
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border/40 py-4">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className={cn(
                      "block px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                      item.current
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
              
              {/* Mobile User Section - Dynamic based on login state */}
              <div className="px-3 pt-3 border-t border-border/40">
                {isLoading ? (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-24 h-4 bg-muted animate-pulse rounded"></div>
                      <div className="w-32 h-3 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ) : isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profileImage || ''} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                          {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.firstName || ''} {user.lastName || ''}</p>
                        <p className="text-xs text-muted-foreground">{user.email || ''}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href="/profile">
                        <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-mobile-profile">
                          <User className="w-4 h-4 mr-2" />
                          Ο Λογαριασμός μου
                        </Button>
                      </Link>
                      <Link href="/orders">
                        <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-mobile-orders">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Οι Παραγγελίες μου
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full justify-start" 
                        onClick={handleLogout}
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Αποσύνδεση
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" data-testid="button-mobile-login">
                        <User className="w-4 h-4 mr-2" />
                        Σύνδεση
                      </Button>
                    </Link>
                    <Link href="/signup" className="flex-1">
                      <Button size="sm" className="w-full" data-testid="button-mobile-signup">
                        Εγγραφή
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}