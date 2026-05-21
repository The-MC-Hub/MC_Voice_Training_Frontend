import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, HelpCircle, Book, MessageSquare, Zap } from 'lucide-react';

const HelpCenter = () => {
  const faqs = [
    { q: "How do I start a practice session?", a: "Navigate to the 'Training' section, choose a script or lesson, and click 'Start Practice'. Ensure your microphone is enabled." },
    { q: "How is my performance calculated?", a: "Our AI analyzes your accuracy, rhythm, and tone compared to professional MC benchmarks. You'll receive a detailed report after each session." },
    { q: "Can I upload my own scripts?", a: "Currently, you can use scripts from our library. Custom script uploading is a feature coming in our next major update." },
    { q: "Is there a mobile app?", a: "The MC Hub is currently a web-based platform optimized for desktop and mobile browsers. A native app is in development." }
  ];

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
              How can we <span className="text-[#f5a623]">help?</span>
            </h1>
            <div className="max-w-xl mx-auto relative group mt-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#f5a623] transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search for articles, guides, or FAQs..."
                className="w-full bg-[#111113] border border-white/[0.07] rounded-xl py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-white/[0.14] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
            {[
              { icon: Book, title: "Getting Started", desc: "Learn the basics of using The MC Hub" },
              { icon: Zap, title: "Voice Training", desc: "Master our AI analysis features" },
              { icon: MessageSquare, title: "MC Community", desc: "Connect with other professional MCs" }
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-6 bg-[#111113] border border-white/[0.07] rounded-xl hover:border-white/[0.12] hover:bg-[#1a1a1e] transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-[#f5a623]/[0.08] flex items-center justify-center text-[#f5a623] mb-4 group-hover:bg-[#f5a623]/[0.12] transition-colors">
                  <Icon size={20} />
                </div>
                <h3 className="text-[14px] font-semibold text-white mb-1">{title}</h3>
                <p className="text-[13px] text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-[18px] font-semibold text-white mb-5">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-5 bg-[#111113] border border-white/[0.07] rounded-xl">
                  <h4 className="text-[14px] font-semibold text-white mb-2.5 flex items-start gap-2.5">
                    <HelpCircle className="text-[#f5a623] shrink-0 mt-0.5" size={16} />
                    {faq.q}
                  </h4>
                  <p className="text-[13px] text-zinc-500 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
