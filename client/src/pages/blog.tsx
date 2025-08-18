import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Search, BookOpen, Lightbulb, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock blog data - in real app would come from API
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['/api/blog', selectedCategory],
    enabled: false, // Disabled until API is implemented
  });

  // Mock blog posts for demo
  const mockBlogPosts = [
    {
      id: "1",
      title: "Η Μαγεία των Fractal Puzzles: Μια Εισαγωγή στα Μαθηματικά της Φύσης",
      slug: "magia-fractal-puzzles-eisagogi",
      excerpt: "Ανακαλύψτε πώς τα fractal patterns που βλέπετε στη φύση μπορούν να γίνουν όμορφα puzzle που συνδυάζουν τέχνη και επιστήμη.",
      content: "...",
      author: "Dr. Maria Παπαδοπούλου",
      category: "education",
      tags: ["fractals", "μαθηματικά", "φύση"],
      featuredImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      publishedAt: new Date("2025-08-10"),
      readTime: 8,
      views: 1247
    },
    {
      id: "2", 
      title: "5 Συμβουλές για να Λύσετε Γρηγορότερα τα Fractal Puzzles σας",
      slug: "5-symvoules-fractal-puzzles",
      excerpt: "Μάθετε τεχνικές που θα σας βοηθήσουν να ολοκληρώνετε τα puzzle σας πιο αποτελεσματικά και να απολαμβάνετε περισσότερο τη διαδικασία.",
      content: "...",
      author: "Νίκος Γεωργίου",
      category: "tips",
      tags: ["συμβουλές", "τεχνική", "ταχύτητα"],
      featuredImage: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      publishedAt: new Date("2025-08-08"),
      readTime: 5,
      views: 892
    },
    {
      id: "3",
      title: "Πελάτισσα της Εβδομάδας: Η Ελένη και το Mandelbrot Set των 2000 κομματιών",
      slug: "pelatissa-evdomadas-eleni-mandelbrot",
      excerpt: "Γνωρίστε την Ελένη, που ολοκλήρωσε το πιο δύσκολο puzzle μας σε χρόνο ρεκόρ και μοιράζεται τις εμπειρίες της.",
      content: "...",
      author: "PuzzleCraft Team",
      category: "spotlight",
      tags: ["πελάτης", "επιτυχία", "mandelbrot"],
      featuredImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      publishedAt: new Date("2025-08-05"),
      readTime: 4,
      views: 654
    },
    {
      id: "4",
      title: "Νέα Συλλογή: Φρακταλικά Δέντρα - Όταν η Φύση Συναντά τα Μαθηματικά",
      slug: "nea-syllogei-fraktalika-dentra",
      excerpt: "Παρουσιάζουμε τη νέα μας συλλογή εμπνευσμένη από τα φρακταλικά patterns των δέντρων και των φυτών.",
      content: "...",
      author: "Άννα Κωνσταντίνου",
      category: "news",
      tags: ["νέα συλλογή", "φύση", "δέντρα"],
      featuredImage: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      publishedAt: new Date("2025-08-03"),
      readTime: 6,
      views: 1105
    },
    {
      id: "5",
      title: "DIY: Κατασκευάστε το Δικό σας Fractal Art με Απλά Εργαλεία",
      slug: "diy-kataskevasate-fractal-art",
      excerpt: "Οδηγός βήμα προς βήμα για να δημιουργήσετε τα δικά σας fractal patterns που μπορούν να γίνουν custom puzzle.",
      content: "...",
      author: "Γιάννης Μιχαηλίδης",
      category: "education",
      tags: ["diy", "tutorial", "δημιουργία"],
      featuredImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      publishedAt: new Date("2025-08-01"),
      readTime: 12,
      views: 743
    }
  ];

  const categories = [
    { id: "all", name: "Όλα", icon: BookOpen, count: mockBlogPosts.length },
    { id: "education", name: "Εκπαίδευση", icon: Lightbulb, count: mockBlogPosts.filter(p => p.category === "education").length },
    { id: "tips", name: "Συμβουλές", icon: Star, count: mockBlogPosts.filter(p => p.category === "tips").length },
    { id: "news", name: "Νέα", icon: TrendingUp, count: mockBlogPosts.filter(p => p.category === "news").length },
    { id: "spotlight", name: "Spotlight", icon: User, count: mockBlogPosts.filter(p => p.category === "spotlight").length },
  ];

  const filteredPosts = mockBlogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'education': return 'bg-blue-100 text-blue-800';
      case 'tips': return 'bg-green-100 text-green-800';
      case 'news': return 'bg-purple-100 text-purple-800';
      case 'spotlight': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.name || category;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PuzzleCraft Blog
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Ανακαλύψτε τον κόσμο των fractal puzzles, μάθετε νέες τεχνικές και εμπνευστείτε από τις ιστορίες των πελατών μας
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Αναζήτηση άρθρων..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-blog"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`filter-${category.id}`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name} ({category.count})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <Card className="mb-8 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative">
              <img 
                src={filteredPosts[0].featuredImage}
                alt={filteredPosts[0].title}
                className="w-full h-64 lg:h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge className={getCategoryColor(filteredPosts[0].category)}>
                  Επιλεγμένο Άρθρο
                </Badge>
              </div>
            </div>
            <CardContent className="p-6 flex flex-col justify-center">
              <Badge className={`${getCategoryColor(filteredPosts[0].category)} mb-3 w-fit`}>
                {getCategoryName(filteredPosts[0].category)}
              </Badge>
              <h2 className="text-2xl font-bold mb-3 leading-tight">
                {filteredPosts[0].title}
              </h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {filteredPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {filteredPosts[0].author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {filteredPosts[0].publishedAt.toLocaleDateString('el-GR')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {filteredPosts[0].readTime} λεπτά
                </div>
              </div>
              <Button asChild data-testid={`read-more-${filteredPosts[0].id}`}>
                <Link href={`/blog/${filteredPosts[0].slug}`}>
                  Διαβάστε Περισσότερα
                </Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      )}

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredPosts.slice(1).map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryName(post.category)}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg leading-tight line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}min
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {post.publishedAt.toLocaleDateString('el-GR')}
                </span>
                <Button variant="outline" size="sm" asChild data-testid={`read-post-${post.id}`}>
                  <Link href={`/blog/${post.slug}`}>
                    Διαβάστε
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Δεν βρέθηκαν άρθρα</h3>
            <p className="text-muted-foreground mb-6">
              Δοκιμάστε διαφορετικούς όρους αναζήτησης ή κατηγορίες
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              data-testid="button-clear-filters"
            >
              Καθαρισμός Φίλτρων
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Subscription */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Μείνετε Ενημερωμένοι</h3>
          <p className="text-muted-foreground mb-6">
            Λάβετε τα τελευταία άρθρα, συμβουλές και νέα για fractal puzzles απευθείας στο email σας
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Το email σας"
              type="email"
              data-testid="input-newsletter-email"
            />
            <Button data-testid="button-subscribe-newsletter">
              Εγγραφή
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Δεν θα σπαμάρουμε. Μπορείτε να κάνετε unsubscribe οποτεδήποτε.
          </p>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Δημοφιλή Θέματα</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['fractals', 'μαθηματικά', 'συμβουλές', 'τεχνική', 'φύση', 'mandelbrot', 'julia', 'diy', 'tutorial', 'επιτυχία'].map(tag => (
              <Button 
                key={tag}
                variant="outline" 
                size="sm"
                onClick={() => setSearchTerm(tag)}
                data-testid={`tag-${tag}`}
              >
                #{tag}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}