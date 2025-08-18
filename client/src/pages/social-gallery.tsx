import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Clock, Trophy, Star, Filter, Upload, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function SocialGalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const queryClient = useQueryClient();

  // Mock social gallery data
  const mockGalleryPosts = [
    {
      id: "1",
      userId: "user1",
      userName: "Ελένη Παπαδοπούλου",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      title: "Το δυσκολότερο Mandelbrot που έκανα ποτέ!",
      description: "2000 κομμάτια, 3 εβδομάδες συνεχούς δουλειάς. Αξίζει κάθε λεπτό!",
      imageUrl: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      difficulty: "Δύσκολο",
      completionTime: 1260, // minutes
      likes: 47,
      comments: 12,
      createdAt: new Date("2025-08-10"),
      isPublic: true,
      tags: ["mandelbrot", "2000pieces", "challenge"]
    },
    {
      id: "2",
      userId: "user2", 
      userName: "Γιάννης Νικολάου",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      title: "Golden Spiral - Οικογενειακό project",
      description: "Το έκανα μαζί με τα παιδιά μου. Τέλειο για να μάθουν fractals!",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      difficulty: "Μέτριο",
      completionTime: 480,
      likes: 23,
      comments: 8,
      createdAt: new Date("2025-08-08"),
      isPublic: true,
      tags: ["family", "education", "golden-spiral"]
    },
    {
      id: "3",
      userId: "user3",
      userName: "Μαρία Κωνσταντίνου", 
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      title: "Julia Set σε ξύλο - Απίστευτη ποιότητα!",
      description: "Πρώτη φορά με ξύλινο puzzle. Η αίσθηση είναι μοναδική!",
      imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      difficulty: "Εύκολο",
      completionTime: 360,
      likes: 31,
      comments: 6,
      createdAt: new Date("2025-08-06"),
      isPublic: true,
      tags: ["julia", "wood", "premium"]
    },
    {
      id: "4",
      userId: "user4",
      userName: "Πέτρος Αντωνίου",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150", 
      title: "Fractal Tree - Η φύση συναντά τα μαθηματικά",
      description: "Εκπληκτική λεπτομέρεια στα κλαδιά. Κάθε κομμάτι είναι τέχνη!",
      imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      difficulty: "Μέτριο",
      completionTime: 720,
      likes: 19,
      comments: 4,
      createdAt: new Date("2025-08-04"),
      isPublic: true,
      tags: ["nature", "tree", "mathematics"]
    },
    {
      id: "5",
      userId: "user5",
      userName: "Αναστασία Βασιλείου",
      userAvatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      title: "Πρώτο puzzle στα 12 μου χρόνια!",
      description: "Μαμά μου με βοήθησε, αλλά τα περισσότερα κομμάτια τα έκανα εγώ!",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      difficulty: "Εύκολο",
      completionTime: 240,
      likes: 56,
      comments: 18,
      createdAt: new Date("2025-08-02"),
      isPublic: true,
      tags: ["first-puzzle", "young", "achievement"]
    }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} λεπτά`;
    return `${hours}ώ ${mins}λ`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Εύκολο': return 'bg-green-100 text-green-800';
      case 'Μέτριο': return 'bg-yellow-100 text-yellow-800';
      case 'Δύσκολο': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPosts = selectedFilter === "all" 
    ? mockGalleryPosts
    : mockGalleryPosts.filter(post => post.difficulty === selectedFilter);

  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiRequest(`/api/social/like/${postId}`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/social/gallery'] });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Κοινότητα Puzzle
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Μοιραστείτε τις επιτυχίες σας και εμπνευστείτε από άλλους puzzle enthusiasts
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockGalleryPosts.length}</div>
            <div className="text-sm text-muted-foreground">Κοινοποιήσεις</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockGalleryPosts.reduce((sum, p) => sum + p.likes, 0)}</div>
            <div className="text-sm text-muted-foreground">Συνολικά Likes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockGalleryPosts.reduce((sum, p) => sum + p.comments, 0)}</div>
            <div className="text-sm text-muted-foreground">Σχόλια</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">47</div>
            <div className="text-sm text-muted-foreground">Ενεργά Μέλη</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gallery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery" data-testid="tab-gallery">Γκαλερί</TabsTrigger>
          <TabsTrigger value="my-posts" data-testid="tab-my-posts">Οι Δικές μου</TabsTrigger>
          <TabsTrigger value="upload" data-testid="tab-upload">Μεταφόρτωση</TabsTrigger>
        </TabsList>

        {/* Main Gallery */}
        <TabsContent value="gallery" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Φιλτράρισμα:</span>
            {["all", "Εύκολο", "Μέτριο", "Δύσκολο"].map(filter => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                data-testid={`filter-${filter}`}
              >
                {filter === "all" ? "Όλα" : filter}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    data-testid={`post-image-${post.id}`}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={getDifficultyColor(post.difficulty)}>
                      {post.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTime(post.completionTime)}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <img 
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">{post.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {post.userName} • {post.createdAt.toLocaleDateString('el-GR')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button 
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                        onClick={() => likeMutation.mutate(post.id)}
                        data-testid={`like-${post.id}`}
                      >
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`share-${post.id}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Posts */}
        <TabsContent value="my-posts" className="space-y-6">
          <Card className="text-center py-16">
            <CardContent>
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Δεν έχετε κοινοποιήσεις ακόμη</h3>
              <p className="text-muted-foreground mb-6">
                Μοιραστείτε τα ολοκληρωμένα puzzles σας με την κοινότητα!
              </p>
              <Button data-testid="button-share-first">
                Κοινοποιήστε το Πρώτο σας
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Μοιραστείτε την Επιτυχία σας</CardTitle>
              <CardDescription>
                Ανεβάστε φωτογραφία από το ολοκληρωμένο puzzle σας και εμπνεύστε άλλους
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Σύρετε μια φωτογραφία εδώ ή κάντε κλικ για επιλογή
                </p>
                <Button variant="outline" data-testid="button-select-image">
                  Επιλογή Εικόνας
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Τίτλος</label>
                  <input 
                    type="text"
                    placeholder="Δώστε έναν τίτλο στην κοινοποίησή σας"
                    className="w-full p-2 border rounded"
                    data-testid="input-post-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Δυσκολία</label>
                  <select className="w-full p-2 border rounded" data-testid="select-difficulty">
                    <option>Εύκολο</option>
                    <option>Μέτριο</option>
                    <option>Δύσκολο</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Περιγραφή</label>
                <textarea 
                  placeholder="Μοιραστείτε την εμπειρία σας, συμβουλές ή ό,τι άλλο θέλετε..."
                  className="w-full p-2 border rounded h-24 resize-none"
                  data-testid="textarea-description"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags (προαιρετικό)</label>
                <input 
                  type="text"
                  placeholder="π.χ. mandelbrot, challenging, family"
                  className="w-full p-2 border rounded"
                  data-testid="input-tags"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Χωρίστε τα tags με κόμματα
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="public" defaultChecked data-testid="checkbox-public" />
                <label htmlFor="public" className="text-sm">
                  Κάντε την κοινοποίηση δημόσια (προτείνεται)
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Ακύρωση</Button>
                <Button data-testid="button-publish-post">
                  <Camera className="w-4 h-4 mr-2" />
                  Δημοσίευση
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Οδηγίες Κοινοποίησης</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-green-600">✓</span>
                <span>Φωτογραφίες υψηλής ποιότητας με καλό φωτισμό</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-green-600">✓</span>
                <span>Μοιραστείτε συμβουλές και εμπειρίες</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-green-600">✓</span>
                <span>Χρησιμοποιήστε περιγραφικούς τίτλους</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-red-600">✗</span>
                <span>Μη ανεβάζετε εικόνες που δεν σας ανήκουν</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-red-600">✗</span>
                <span>Αποφύγετε spam ή άσχετο περιεχόμενο</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Community Stats */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Συμμετέχετε στην Κοινότητα</h3>
          <p className="text-muted-foreground mb-6">
            Ανακαλύψτε νέα patterns, μάθετε τεχνικές και συνδεθείτε με άλλους puzzle lovers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-1">Εμπνευστείτε</h4>
              <p className="text-sm text-muted-foreground">Δείτε απίστευτα designs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-1">Συνδεθείτε</h4>
              <p className="text-sm text-muted-foreground">Κάντε νέες φιλίες</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-1">Επιτύχετε</h4>
              <p className="text-sm text-muted-foreground">Μοιραστείτε τις νίκες σας</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}