import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TermsOfService = () => (
  <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
    <Navbar />
    <main className="flex-1 pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            Terms of <span className="text-[#f5a623]">Service</span>
          </h1>
          <p className="text-[12px] text-zinc-600 uppercase tracking-wider">Effective Date: May 16, 2026</p>
        </div>

        <div className="space-y-8">
          {[
            { icon: FileText, title: "1. Acceptance of Terms", body: "By accessing or using The MC Hub platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services." },
            { icon: CheckCircle, title: "2. User Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information." },
            { icon: AlertCircle, title: "3. Content Usage", body: "Our platform provides scripts and training materials for practice purposes. You may not redistribute, sell, or claim ownership of the intellectual property provided on the platform unless explicitly authorized." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
              <h2 className="text-[15px] font-semibold text-white flex items-center gap-2.5 mb-3">
                <Icon size={16} className="text-[#f5a623]" /> {title}
              </h2>
              <p className="text-[14px] text-zinc-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
