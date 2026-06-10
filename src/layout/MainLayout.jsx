import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdSidebar from "../components/ui/AdSidebar";
import { Outlet, useLocation } from "react-router-dom";

const AD_EXCLUDED = ['/m/admin', '/m/voice/practice', '/login', '/register', '/onboarding'];

const MainLayout = () => {
  const location = useLocation();
  const showAd = !AD_EXCLUDED.some(p => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <div className="h-14 shrink-0" />
      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 overflow-y-auto${showAd ? ' md:mr-45' : ''}`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.12) transparent',
          }}
        >
          <div className="w-full min-h-full flex flex-col">
            <section className="flex-1 p-3 sm:p-4 lg:p-8">
              <Outlet />
            </section>
            <Footer />
          </div>
        </main>
        <AdSidebar />
      </div>
    </div>
  );
};

export default MainLayout;
