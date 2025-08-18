import ProductConfigurator from "@/components/product-configurator";

export default function Configurator() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-neutral mb-4">Δημιουργήστε το Παζλ σας</h1>
          <p className="text-xl text-gray-600">Ακολουθήστε τα απλά βήματα για να φτιάξετε το τέλειο προσωποποιημένο παζλ</p>
        </div>
        <ProductConfigurator />
      </div>
    </div>
  );
}
