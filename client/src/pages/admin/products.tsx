import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  Upload,
  Eye,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const productSchema = z.object({
  name: z.string().min(1, "Το όνομα είναι απαραίτητο"),
  description: z.string().min(10, "Η περιγραφή πρέπει να έχει τουλάχιστον 10 χαρακτήρες"),
  category: z.string().min(1, "Η κατηγορία είναι απαραίτητη"),
  material: z.string().min(1, "Το υλικό είναι απαραίτητο"),
  size: z.string().min(1, "Το μέγεθος είναι απαραίτητο"),
  pieceCount: z.number().min(50, "Τουλάχιστον 50 κομμάτια"),
  price: z.number().min(0.01, "Η τιμή πρέπει να είναι μεγαλύτερη από 0"),
  stock: z.number().min(0, "Το απόθεμα δεν μπορεί να είναι αρνητικό"),
  isActive: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      material: "wood",
      size: "",
      pieceCount: 500,
      price: 0,
      stock: 0,
      isActive: true,
    },
  });

  // Mock data - in real app would come from API
  const mockProducts = [
    {
      id: "1",
      name: "Fractal Mandala Premium",
      description: "Εκπληκτικό fractal mandala σε υψηλή ανάλυση",
      category: "fractal",
      material: "wood",
      size: "40x40cm",
      pieceCount: 1000,
      price: 89.90,
      stock: 45,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
      createdAt: "2025-08-01"
    },
    {
      id: "2", 
      name: "Sacred Geometry",
      description: "Ιερή γεωμετρία με χρυσή τομή",
      category: "geometry",
      material: "acrylic",
      size: "30x30cm",
      pieceCount: 750,
      price: 67.50,
      stock: 12,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1552308995-2baac1ad5490?w=200",
      createdAt: "2025-07-28"
    },
    {
      id: "3",
      name: "Cosmic Patterns",
      description: "Κοσμικά μοτίβα με galactic theme",
      category: "cosmic",
      material: "paper",
      size: "50x35cm", 
      pieceCount: 1500,
      price: 124.90,
      stock: 3,
      isActive: false,
      imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200",
      createdAt: "2025-07-25"
    },
  ];

  const categories = [
    { value: "all", label: "Όλες οι Κατηγορίες" },
    { value: "fractal", label: "Fractal" },
    { value: "geometry", label: "Γεωμετρία" },
    { value: "cosmic", label: "Κοσμικά" },
    { value: "custom", label: "Προσωποποιημένα" },
  ];

  const materials = [
    { value: "wood", label: "Ξύλο" },
    { value: "acrylic", label: "Ακρυλικό" },
    { value: "paper", label: "Χαρτόνι" },
  ];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const onSubmit = (data: ProductForm) => {
    console.log("Product data:", data);
    toast({
      title: editingProduct ? "Προϊόν Ενημερώθηκε" : "Προϊόν Δημιουργήθηκε",
      description: "Το προϊόν αποθηκεύτηκε επιτυχώς.",
    });
    setIsAddDialogOpen(false);
    setEditingProduct(null);
    form.reset();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      category: product.category,
      material: product.material,
      size: product.size,
      pieceCount: product.pieceCount,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;")) {
      toast({
        title: "Προϊόν Διαγράφηκε",
        description: "Το προϊόν διαγράφηκε επιτυχώς.",
      });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Καμία Επιλογή",
        description: "Επιλέξτε τουλάχιστον ένα προϊόν.",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case "delete":
        if (confirm(`Διαγραφή ${selectedProducts.size} προϊόντων;`)) {
          toast({ title: "Προϊόντα Διαγράφηκαν", description: `${selectedProducts.size} προϊόντα διαγράφηκαν.` });
          setSelectedProducts(new Set());
        }
        break;
      case "activate":
        toast({ title: "Προϊόντα Ενεργοποιήθηκαν", description: `${selectedProducts.size} προϊόντα ενεργοποιήθηκαν.` });
        setSelectedProducts(new Set());
        break;
      case "deactivate":
        toast({ title: "Προϊόντα Απενεργοποιήθηκαν", description: `${selectedProducts.size} προϊόντα απενεργοποιήθηκαν.` });
        setSelectedProducts(new Set());
        break;
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { variant: "destructive" as const, label: "Εξαντλήθηκε" };
    if (stock <= 5) return { variant: "outline" as const, label: "Χαμηλό απόθεμα" };
    return { variant: "secondary" as const, label: "Διαθέσιμο" };
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Διαχείριση Προϊόντων</h1>
          <p className="text-muted-foreground">Διαχειριστείτε τα προϊόντα του καταστήματος</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Νέο Προϊόν
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Επεξεργασία Προϊόντος" : "Νέο Προϊόν"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Επεξεργαστείτε τα στοιχεία του προϊόντος" : "Δημιουργήστε νέο προϊόν"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Όνομα Προϊόντος</FormLabel>
                        <FormControl>
                          <Input placeholder="π.χ. Fractal Mandala" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Κατηγορία</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλογή κατηγορίας" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.slice(1).map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Περιγραφή</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Αναλυτική περιγραφή του προϊόντος..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Υλικό</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materials.map(material => (
                              <SelectItem key={material.value} value={material.value}>
                                {material.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Μέγεθος</FormLabel>
                        <FormControl>
                          <Input placeholder="π.χ. 40x40cm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pieceCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Κομμάτια</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Τιμή (€)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Απόθεμα</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ενεργό</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingProduct(null);
                      form.reset();
                    }}
                  >
                    Ακύρωση
                  </Button>
                  <Button type="submit">
                    {editingProduct ? "Ενημέρωση" : "Δημιουργία"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Αναζήτηση προϊόντων..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-products"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedProducts.size} προϊόν(τα) επιλεγμένα
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("activate")}
                  data-testid="button-bulk-activate"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ενεργοποίηση
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("deactivate")}
                  data-testid="button-bulk-deactivate"
                >
                  Απενεργοποίηση
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  data-testid="button-bulk-delete"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Διαγραφή
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Προϊόντα ({filteredProducts.length})</CardTitle>
          <CardDescription>Διαχειριστείτε όλα τα προϊόντα του καταστήματος</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Προϊόν</TableHead>
                <TableHead>Κατηγορία</TableHead>
                <TableHead>Υλικό</TableHead>
                <TableHead>Κομμάτια</TableHead>
                <TableHead>Τιμή</TableHead>
                <TableHead>Απόθεμα</TableHead>
                <TableHead>Κατάσταση</TableHead>
                <TableHead>Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.size}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories.find(c => c.value === product.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{product.material}</TableCell>
                  <TableCell>{product.pieceCount}</TableCell>
                  <TableCell>€{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.stock <= 5 && product.stock > 0 && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                      <span className={product.stock <= 5 ? "text-orange-600 font-medium" : ""}>
                        {product.stock}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={product.isActive ? "secondary" : "outline"}>
                        {product.isActive ? "Ενεργό" : "Ανενεργό"}
                      </Badge>
                      <Badge variant={getStockStatus(product.stock).variant}>
                        {getStockStatus(product.stock).label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        data-testid={`button-edit-product-${product.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        data-testid={`button-delete-product-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}