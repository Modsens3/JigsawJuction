import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await apiRequest("POST", "/api/auth/admin/login", {
        username: credentials.username,
        password: credentials.password,
      });

      console.log("Admin login result:", result); // Debug log

      // Persist admin token so future admin requests include Authorization header
      if (result?.token) {
        localStorage.setItem("token", result.token);
        console.log("Token saved:", result.token.substring(0, 50) + "..."); // Debug log
      } else {
        console.error("No token in response:", result); // Debug log
        setError("Δεν λήφθηκε token από τον server");
        return;
      }
      // Optional: store minimal user info
      if (result?.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      toast({
        title: "Επιτυχής σύνδεση",
        description: "Καλώς ήρθατε στη διαχείριση FractalCraft",
      });

      setLocation("/admin/dashboard");
    } catch (e) {
      console.error("Admin login error:", e); // Debug log
      setError("Λάθος στοιχεία σύνδεσης");
    }
    
    setIsLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="absolute inset-0 fractal-bg opacity-20"></div>
      
      <Card className="w-full max-w-md mx-4 glass-morphism border-primary/20 relative z-10">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Διαχείριση FractalCraft
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Συνδεθείτε για πρόσβαση στο admin panel
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Εισάγετε το username σας"
                required
                data-testid="input-username"
                className="glass-morphism border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Εισάγετε τον κωδικό σας"
                required
                data-testid="input-password"
                className="glass-morphism border-primary/20"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Σύνδεση..." : "Σύνδεση στη Διαχείριση"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Στοιχεία demo: admin / admin123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}