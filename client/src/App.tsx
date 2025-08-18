import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Configurator from "@/pages/configurator";

import Cart from "@/pages/cart";
import FractalGenerator from "@/pages/fractal-generator";
import { PuzzleGeneratorPage } from "@/pages/puzzle-generator";
import ImageEditorPage from "@/pages/image-editor";
import CustomerService from "@/pages/customer-service";
import FAQ from "@/pages/faq";
import OrderTracking from "@/pages/order-tracking";
import Returns from "@/pages/returns";
import Contact from "@/pages/contact";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ShoppingCart from "@/components/shopping-cart";
import Loyalty from "@/pages/loyalty";
import Blog from "@/pages/blog";
import ProgressTracker from "@/pages/progress-tracker";
import SocialGallery from "@/pages/social-gallery";
import Subscription from "@/pages/subscription";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfUse from "@/pages/terms-of-use";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Profile from "@/pages/profile";
import Orders from "@/pages/orders";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminProducts from "@/pages/admin/products";
import AdminCustomers from "@/pages/admin/customers";
import AdminStorage from "@/pages/admin/storage";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/fractal-generator" component={FractalGenerator} />
      <Route path="/puzzle-generator" component={PuzzleGeneratorPage} />
      <Route path="/image-editor" component={ImageEditorPage} />
      <Route path="/cart" component={Cart} />
      <Route path="/customer-service" component={CustomerService} />
      <Route path="/faq" component={FAQ} />
      <Route path="/order-tracking" component={OrderTracking} />
      <Route path="/returns" component={Returns} />
      <Route path="/contact" component={Contact} />
      <Route path="/loyalty" component={Loyalty} />
      <Route path="/blog" component={Blog} />
      <Route path="/progress-tracker" component={ProgressTracker} />
      <Route path="/social-gallery" component={SocialGallery} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-use" component={TermsOfUse} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/profile" component={Profile} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/storage" component={AdminStorage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-confirmation" component={OrderConfirmation} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <ShoppingCart />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
