import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiApple } from "react-icons/si";

const loginSchema = z.object({
  email: z.string().email("Εισάγετε έγκυρο email"),
  password: z.string().min(6, "Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return await apiRequest('POST', '/api/auth/login', data);
    },
    onSuccess: (data) => {
      // Update the user data in the cache
      queryClient.setQueryData(['/api/auth/user'], data.user);
      
      toast({
        title: "Επιτυχής Σύνδεση!",
        description: "Καλώς ήρθατε πίσω στο FractalCraft!",
      });
      
      // Force a page reload to ensure the header updates
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Σφάλμα Σύνδεσης",
        description: error.message || "Λάθος στοιχεία σύνδεσης",
        variant: "destructive",
      });
    },
  });

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Redirect to social login endpoint
    window.location.href = `/api/auth/${provider}`;
  };

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="glass-morphism border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <LogIn className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Σύνδεση
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Συνδεθείτε στον λογαριασμό σας για να συνεχίσετε
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Κωδικός</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Εισάγετε τον κωδικό σας"
                            data-testid="input-password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-submit-login"
                >
                  {loginMutation.isPending ? "Σύνδεση..." : "Σύνδεση"}
                </Button>
              </form>
            </Form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">ή συνδεθείτε με</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full"
                  data-testid="button-google-login"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialLogin('apple')}
                  className="w-full"
                  data-testid="button-apple-login"
                >
                  <SiApple className="w-5 h-5 mr-2" />
                  Apple
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Δεν έχετε λογαριασμό;{" "}
                <Link href="/signup">
                  <span className="font-medium text-primary hover:text-primary/80 cursor-pointer" data-testid="link-signup">
                    Εγγραφή εδώ
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}