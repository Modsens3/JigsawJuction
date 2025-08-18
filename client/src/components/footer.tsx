import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="glass-morphism border-t border-primary/20 relative overflow-hidden py-16">
      {/* Fractal background elements */}
      <div className="fractal-shape w-16 h-16 top-5 left-20 opacity-10"></div>
      <div className="fractal-shape w-20 h-20 bottom-10 right-32 opacity-15"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="fractal-glow w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FractalCraft
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Δημιουργούμε προσωποποιημένα παζλ υψηλής ποιότητας που φέρνουν χαρά και δημιουργικότητα στη ζωή σας.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
                data-testid="link-facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
                data-testid="link-instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.297L6.468 14.34c.568.568 1.34.91 2.188.91c1.694 0 3.066-1.372 3.066-3.066c0-.847-.342-1.62-.91-2.188l1.351-1.351c.807.88 1.297 2.031 1.297 3.328c0 2.692-2.183 4.875-4.875 4.875z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Γρήγοροι Σύνδεσμοι</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-primary transition-colors" data-testid="link-footer-home">
                  Αρχική
                </Link>
              </li>
              <li>
                <Link href="/configurator" className="text-gray-300 hover:text-primary transition-colors" data-testid="link-footer-configurator">
                  Δημιουργία Παζλ
                </Link>
              </li>

            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Εξυπηρέτηση Πελατών</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-primary transition-colors" data-testid="link-footer-faq">
                  Συχνές Ερωτήσεις
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="text-gray-300 hover:text-primary transition-colors" data-testid="link-footer-tracking">
                  Παρακολούθηση Παραγγελίας
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-primary transition-colors" data-testid="link-footer-returns">
                  Επιστροφές
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors" data-testid="link-footer-contact">
                  Επικοινωνία
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Επικοινωνία</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Αθήνα, Ελλάδα</span>
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+30 210 123 4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@puzzlecraft.gr</span>
              </div>
              <div className="flex items-center text-gray-300">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Δευ-Παρ: 9:00-18:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 PuzzleCraft. Όλα τα δικαιώματα διατηρούνται. | 
            <a href="/privacy-policy" className="hover:text-primary transition-colors ml-1">Πολιτική Απορρήτου</a> | 
            <a href="/terms-of-use" className="hover:text-primary transition-colors ml-1">Όροι Χρήσης</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
