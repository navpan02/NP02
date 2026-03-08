import Navbar from './Navbar';
import Footer from './Footer';
import CleanLawnNav from './CleanLawnNav';

export default function Layout({ children, noFooter = false }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CleanLawnNav />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
    </div>
  );
}
