import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Lock, Scale } from 'lucide-react';

const PrivacyHub = () => (
  <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
    <Navbar />
    <main className="flex-1 pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            Privacy <span className="text-[#f5a623]">Policy</span>
          </h1>
          <p className="text-[12px] text-zinc-600 uppercase tracking-wider">Last updated: May 16, 2026</p>
        </div>

        <div className="space-y-8">
          <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2.5 mb-3">
              <Shield size={16} className="text-[#f5a623]" /> 1. Information We Collect
            </h2>
            <div className="space-y-3 text-[14px] text-zinc-500 leading-relaxed">
              <p>We collect information you provide directly to us when you create an account, update your profile, use our voice training features, or communicate with us.</p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
                <li>Personal identifiers (Name, email, phone number)</li>
                <li>Voice recordings for training analysis</li>
                <li>Payment information (processed securely via our partners)</li>
                <li>Usage data and performance metrics</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2.5 mb-3">
              <Lock size={16} className="text-[#f5a623]" /> 2. How We Use Your Information
            </h2>
            <p className="text-[14px] text-zinc-500 leading-relaxed">
              Your data is primarily used to provide, maintain, and improve our services, specifically focusing on personalizing your voice training experience and tracking your progress over time.
            </p>
          </div>

          <div className="bg-[#111113] border border-white/[0.07] rounded-xl p-6">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2.5 mb-3">
              <Scale size={16} className="text-[#f5a623]" /> 3. Data Protection
            </h2>
            <p className="text-[14px] text-zinc-500 leading-relaxed">
              We implement industry-standard security measures to protect your personal information and voice data from unauthorized access, alteration, or disclosure.
            </p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyHub;
