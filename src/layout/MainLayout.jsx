import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatBubble from "../components/ChatBubble";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />
      <div className="h-14 shrink-0" />
      <main
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.12) transparent',
        }}
      >
        <div className="w-full min-h-full flex flex-col">
          <section className="flex-1">
            <Outlet />
          </section>
          <Footer />
        </div>
      </main>
      <ChatBubble />
    </div>
  );
};

export default MainLayout;
