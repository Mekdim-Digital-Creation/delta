import Backdrop from '../components/Backdrop.jsx';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import ProductCatalog from '../components/ProductCatalog.jsx';
import PrintingService from '../components/PrintingService.jsx';
import Portfolio from '../components/Portfolio.jsx';
import Testimonials from '../components/Testimonials.jsx';
import ContactUs from '../components/ContactUs.jsx';
import Footer from '../components/Footer.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import AuthModal from '../components/AuthModal.jsx';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Backdrop />
      <Navbar />
      <main>
        <Hero />
        <ProductCatalog />
        <PrintingService />
        <Portfolio />
        <Testimonials />
        <ContactUs />
      </main>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
    </div>
  );
}