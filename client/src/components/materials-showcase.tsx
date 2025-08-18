import { Card, CardContent } from "@/components/ui/card";
import { Network, Gem, FileText } from "lucide-react";

const materials = [
  {
    id: "wood",
    name: "Ξύλο Premium",
    description: "Φυσική ομορφιά και διάρκεια",
    icon: Network,
    image: "https://images.unsplash.com/photo-1544985361-b420d7a77043?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    price: "+€15.00",
    features: [
      "Υψηλή αντοχή στο χρόνο",
      "Φυσική υφή και άρωμα", 
      "Πολυτελής εμφάνιση",
      "Οικολογικό υλικό"
    ],
    gradientFrom: "from-amber-50",
    gradientTo: "to-orange-50",
    borderColor: "border-primary/20",
    hoverBorderColor: "hover:border-primary/50",
    textColor: "text-primary"
  },
  {
    id: "acrylic",
    name: "Ακρυλικό",
    description: "Μοντέρνο και κομψό",
    icon: Gem,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    price: "+€10.00",
    features: [
      "Διαφανής και λαμπερό",
      "Εύκολος καθαρισμός",
      "Μοντέρνα αισθητική",
      "Ανθεκτικό στην υγρασία"
    ],
    gradientFrom: "from-blue-50",
    gradientTo: "to-cyan-50",
    borderColor: "border-gray-200",
    hoverBorderColor: "hover:border-secondary/50",
    textColor: "text-secondary"
  },
  {
    id: "paper",
    name: "Χαρτί Υψηλής Ποιότητας",
    description: "Κλασικό και οικονομικό",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    price: "€25.00",
    features: [
      "Κλασική εμφάνιση",
      "Οικονομική επιλογή",
      "Ματ φινίρισμα",
      "Ιδανικό για αρχάριους"
    ],
    gradientFrom: "from-gray-50",
    gradientTo: "to-slate-50",
    borderColor: "border-gray-200",
    hoverBorderColor: "hover:border-neutral/50",
    textColor: "text-neutral"
  }
];

export default function MaterialsShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-neutral mb-4">Επιλέξτε το Υλικό σας</h2>
          <p className="text-xl text-gray-600">Κάθε υλικό προσφέρει μοναδική εμπειρία και αισθητική</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {materials.map((material) => {
            const IconComponent = material.icon;
            return (
              <Card
                key={material.id}
                className={`bg-gradient-to-br ${material.gradientFrom} ${material.gradientTo} border-2 ${material.borderColor} ${material.hoverBorderColor} transition-colors`}
                data-testid={`card-material-${material.id}`}
              >
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-${material.id === 'wood' ? 'primary' : material.id === 'acrylic' ? 'secondary' : 'neutral'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral mb-2">{material.name}</h3>
                    <p className="text-gray-600">{material.description}</p>
                  </div>
                  
                  <img 
                    src={material.image} 
                    alt={`${material.name} texture`}
                    className="w-full h-48 object-cover rounded-xl mb-6 shadow-lg"
                    data-testid={`img-material-${material.id}`}
                  />
                  
                  <div className="space-y-3">
                    {material.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <svg className={`w-5 h-5 ${material.textColor} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`mt-6 pt-6 border-t border-${material.id === 'wood' ? 'primary' : material.id === 'acrylic' ? 'secondary' : 'neutral'}/20`}>
                    <div className="text-center">
                      <span className={`text-2xl font-bold ${material.textColor}`} data-testid={`text-material-price-${material.id}`}>
                        {material.price}
                      </span>
                      <p className="text-sm text-gray-600">
                        {material.id === "paper" ? "βασική τιμή" : "επιπλέον κόστος"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
