import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, User, CreditCard, Package, MapPin, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { format } from "date-fns";
import { el } from 'date-fns/locale';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p>Παρακαλώ συνδεθείτε για να δείτε το προφίλ σας</p>
            <Link href="/login">
              <Button className="mt-4">Σύνδεση</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Profile Header */}
        <Card className="glass-morphism border-primary/20">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profileImage || ''} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {user.firstName || ''} {user.lastName || ''}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email || ''}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Μέλος από {user.createdAt ? format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: el }) : 'Πρόσφατα'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid="button-edit-profile">
                  <User className="w-4 h-4 mr-2" />
                  Επεξεργασία
                </Button>
                <Button variant="destructive" size="sm" onClick={logout} data-testid="button-logout">
                  Αποσύνδεση
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="glass-morphism border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Στοιχεία Λογαριασμού
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <Badge variant="secondary">{user.email || ''}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Όνομα</span>
                  <span className="text-sm font-medium">{user.firstName || ''}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Επώνυμο</span>
                  <span className="text-sm font-medium">{user.lastName || ''}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-morphism border-primary/20">
            <CardHeader>
              <CardTitle>Γρήγορες Ενέργειες</CardTitle>
              <CardDescription>
                Διαχείριση λογαριασμού και παραγγελιών
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/orders" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-orders">
                  <Package className="w-4 h-4 mr-2" />
                  Οι Παραγγελίες μου
                </Button>
              </Link>
              
              <Link href="/returns" className="block">
                <Button variant="outline" className="w-full justify-start" data-testid="link-returns">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Επιστροφές & Αλλαγές
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-morphism border-primary/20">
          <CardHeader>
            <CardTitle>Πρόσφατη Δραστηριότητα</CardTitle>
            <CardDescription>
              Οι τελευταίες σας ενέργειες στο FractalCraft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Σύνδεση στον λογαριασμό</p>
                  <p className="text-xs text-muted-foreground">Σήμερα</p>
                </div>
              </div>
              
              <div className="text-center py-6 text-sm text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Δεν υπάρχουν πρόσφατες παραγγελίες
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}