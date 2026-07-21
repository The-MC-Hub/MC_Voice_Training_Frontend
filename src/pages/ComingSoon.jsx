import React from 'react';
import { Mic, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card } from '@/components/ui/card';

const ComingSoon = ({
  title = "Advanced MC Training Course",
  description = "We are crafting a world-class curriculum to elevate your hosting skills to the next level. Stay tuned for our grand launch."
}) => (
  <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
    <Navbar />
    <main className="flex-1 flex items-center justify-center pt-28 pb-20 px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111113] border border-white/[0.07] text-[#f5a623] text-[11px] font-medium uppercase tracking-wider mb-10">
          <Mic size={13} /> Under Development
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
          Something <span className="text-[#f5a623]">extraordinary</span><br />is coming soon
        </h1>

        <p className="text-[15px] text-zinc-500 max-w-lg mx-auto mb-14 leading-relaxed">{description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-xl mx-auto mb-12">
          {[
            { label: "Lessons", value: "24+" },
            { label: "Hours", value: "40+" },
            { label: "Resources", value: "100+" },
            { label: "Quizzes", value: "15" }
          ].map((stat, i) => (
            <Card key={i} className="bg-[#111113] border border-white/[0.07] rounded-md py-4 gap-0 shadow-none">
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-[11px] text-zinc-600 uppercase tracking-wider">{stat.label}</div>
            </Card>
          ))}
        </div>

        <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-zinc-500 hover:text-white transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default ComingSoon;
