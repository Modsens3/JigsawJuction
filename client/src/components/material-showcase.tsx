import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const materials = [
  {
    id: "wood",
    name: "Ξύλο Premium",
    description: "Φυσική ομορφιά και διάρκεια",
    icon: "🌳",
    imageUrl: "https://images.unsplash.com/photo-1544985361-b420d7a77043?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    features: [
      "Υψηλή αντοχή στο χρόνο",
      "Φυσική υφή και άρωμα",
      "Πολυτελής εμφάνιση",
      "Οικολογικό υλικό"
    ],
    price: "+€15.00",
    gradient: "from-amber-50 to-orange-50",
    borderColor: "primary/20",
    iconBg: "primary"
  },
  {
    id: "acrylic",
    name: "Ακρυλικό",
    description: "Μοντέρνο και κομψό",
    icon: "💎",
    imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    features: [
      "Διαφανής και λαμπερό",
      "Εύκολος καθαρισμός",
      "Μοντέρνα αισθητική",
      "Ανθεκτικό στην υγρασία"
    ],
    price: "+€10.00",
    gradient: "from-blue-50 to-cyan-50",
    borderColor: "gray-200",
    iconBg: "secondary"
  },
  {
    id: "paper",
    name: "Χαρτί Υψηλής Ποιότητας",
    description: "Κλασικό και οικονομικό",
    icon: "📄",
    imageUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    features: [
      "Κλασική εμφάνιση",
      "Οικονομική επιλογή",
      "Ματ φινίρισμα",
      "Ιδανικό για αρχάριους"
    ],
    price: "€25.00",
    gradient: "from-gray-50 to-slate-50",
    borderColor: "gray-200",
    iconBg: "neutral"
  }
];

export default function MaterialShowcase() {
  return (
    <section id="materials" className="py-20 bg-white" data-testid="material-showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-neutral mb-4" data-testid="text-materials-title">
            Επιλέξτε το Υλικό σας
          </h3>
          <p className="text-xl text-gray-600" data-testid="text-materials-description">
            Κάθε υλικό προσφέρει μοναδική εμπειρία και αισθητική
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {materials.map((material) => (
            <Card 
              key={material.id} 
              className={`bg-gradient-to-br ${material.gradient} border-2 border-${material.borderColor} hover:border-${material.borderColor.replace('/20', '/50')} transition-colors`}
              data-testid={`card-material-${material.id}`}
            >
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-${material.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{material.icon}</span>
                  </div>
                  <h4 className="text-2xl font-bold text-neutral mb-2" data-testid={`text-material-name-${material.id}`}>
                    {material.name}
                  </h4>
                  <p className="text-gray-600" data-testid={`text-material-description-${material.id}`}>
                    {material.description}
                  </p>
                </div>

                <img
                  src={material.imageUrl}
                  alt={`${material.name} texture`}
                  className="w-full h-48 object-cover rounded-xl mb-6 shadow-lg"
                  data-testid={`img-material-${material.id}`}
                />

                <div className="space-y-3">
                  {material.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-700" data-testid={`text-feature-${material.id}-${index}`}>
                      <Check className={`w-5 h-5 text-${material.iconBg} mr-3`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <span className={`text-2xl font-bold text-${material.iconBg}`} data-testid={`text-material-price-${material.id}`}>
                      {material.price}
                    </span>
                    <p className="text-sm text-gray-600">
                      {material.price.includes('+') ? 'επιπλέον κόστος' : 'βασική τιμή'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
