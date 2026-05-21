import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Linkedin, Github, Facebook, Instagram, Twitter,
  Sparkles, Award, Mail, Target, Globe, Mic2, Heart, Quote
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollReveal from '../components/animations/ScrollReveal';
import LazyImage from '../components/ui/LazyImage';
import ScrollToTop from '../components/ui/ScrollToTop';
import { useTranslation } from 'react-i18next';
import ContactModal from '../components/modals/ContactModal';
import mcImage from '../assets/mc.jpg';

const teamMembers = [
  { id: 1, name: "Lê Trí Trung", role: "CEO (Chief Executive Officer)", specialty: "BackEnd Developer", image: "/images/trung.jpg", bio: "Visionary leader driving the technical backbone of The MC Hub.", socials: { linkedin: "#", twitter: "#", facebook: "#" } },
  { id: 2, name: "Nguyễn Trọng Tiến Minh", role: "CFO (Chief Financial Officer)", specialty: "Business Strategy", image: "/images/minh.jpg", bio: "Ensuring financial health and sustainable business growth.", socials: { linkedin: "#", facebook: "#" } },
  { id: 3, name: "Trần Lê Phương Linh", role: "CPO (Chief Product Officer)", specialty: "Product Design", image: "/images/linh.jpg", bio: "Crafting intuitive and beautiful user experiences.", socials: { linkedin: "#", instagram: "#" } },
  { id: 4, name: "Đinh Quang Duy", role: "CMO (Chief Marketing Officer)", specialty: "Marketing & Communication", image: "/images/duy.jpg", bio: "Connecting The MC Hub with the world through storytelling.", socials: { linkedin: "#", facebook: "#" } },
  { id: 5, name: "Trần Lê Vy", role: "CTO (Chief Technology Officer)", specialty: "Frontend Developer", image: "/images/vy.jpg", bio: "Leading technology innovation and frontend architecture.", socials: { github: "#", linkedin: "#" } },
  { id: 6, name: "Huỳnh Thị Minh Nguyệt", role: "Head of Engineering", specialty: "Frontend Developer", image: "/images/nguyet.jpg", bio: "Orchestrating seamless engineering processes and code quality.", socials: { github: "#", linkedin: "#" } }
];

const SocialIcon = ({ type }) => {
  const icons = { linkedin: Linkedin, github: Github, facebook: Facebook, twitter: Twitter, instagram: Instagram };
  const Icon = icons[type];
  return Icon ? <Icon size={16} /> : null;
};

const About = () => {
  const { t } = useTranslation();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="bg-[#09090b] text-white min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6">
        {/* Subtle CSS dot grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111113] border border-white/[0.07] text-[#f5a623] text-[11px] font-medium uppercase tracking-wider mb-8">
              <Sparkles size={12} /> {t('about.beyondStage')}
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              {t('about.ourStory').split(' ')[0]} <span className="text-[#f5a623]">{t('about.ourStory').split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('about.storyDesc')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <div className="relative">
              <Quote size={80} className="text-[#f5a623]/10 absolute -top-8 -left-8 lg:-left-16" />
              <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-relaxed max-w-3xl mx-auto relative z-10">
                "{t('about.quote')}"
              </h2>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-[#f5a623]/40" />
                <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest">{t('about.philosophy')}</span>
                <div className="h-px w-10 bg-[#f5a623]/40" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-y border-white/[0.06] px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden border border-white/[0.07] bg-[#111113]">
                  <LazyImage src={mcImage} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-[#f5a623] p-6 rounded-2xl text-black z-20">
                  <div className="text-4xl font-bold mb-0.5">500+</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest">MCs Empowered</div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-10 tracking-tight">
                  {t('about.whyWeExist').split(' ').slice(0, 2).join(' ')} <span className="text-[#f5a623]">{t('about.whyWeExist').split(' ').slice(2).join(' ')}</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { icon: <Target size={20} />, color: "text-[#f5a623] bg-[#f5a623]/[0.08] border-[#f5a623]/20", title: t('about.solvingGap'), desc: t('about.solvingGapDesc') },
                    { icon: <Globe size={20} />, color: "text-blue-400 bg-blue-500/[0.08] border-blue-500/20", title: t('about.communityImpact'), desc: t('about.communityImpactDesc') },
                    { icon: <Heart size={20} />, color: "text-purple-400 bg-purple-500/[0.08] border-purple-500/20", title: t('about.ourPassion'), desc: t('about.ourPassionDesc') },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${item.color}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-white mb-1.5">{item.title}</h3>
                        <p className="text-zinc-500 text-[13px] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">
                {t('about.teamTitlePrefix')} <span className="text-[#f5a623]">{t('about.teamTitleSuffix')}</span>
              </h2>
              <p className="text-zinc-500 text-[14px] max-w-xl mx-auto">{t('about.teamDesc')}</p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member, i) => (
              <ScrollReveal key={member.id} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}
                  className="group bg-[#111113] border border-white/[0.07] rounded-2xl p-6 hover:border-[#f5a623]/20 transition-colors overflow-hidden relative">
                  {/* Photo */}
                  <div className="relative mb-5 aspect-square rounded-xl overflow-hidden border border-white/[0.07] group-hover:border-[#f5a623]/20 transition-colors">
                    <LazyImage src={member.image} className="w-full h-full object-cover" />
                    {/* Social overlay */}
                    <div className="absolute inset-0 bg-[#09090b]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                      {Object.entries(member.socials).map(([key, link]) => (
                        <a key={key} href={link}
                          className="w-9 h-9 bg-[#111113] border border-white/[0.08] rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#f5a623] hover:border-[#f5a623]/20 transition-colors">
                          <SocialIcon type={key} />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#f5a623] uppercase tracking-wider font-medium mb-1">{member.specialty}</p>
                    <h3 className="text-[15px] font-semibold text-white group-hover:text-[#f5a623] transition-colors mb-0.5">{member.name}</h3>
                    <p className="text-[11px] text-zinc-600 mb-3">{member.role}</p>
                    <p className="text-zinc-500 text-[13px] leading-relaxed">{member.bio}</p>
                  </div>

                  {/* Decorative number */}
                  <div className="absolute top-5 right-5 text-5xl font-bold text-white/[0.03] select-none pointer-events-none">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="bg-[#111113] border border-white/[0.07] rounded-3xl p-12 lg:p-20 text-center">
              <h2 className="text-3xl lg:text-5xl font-bold mb-8 tracking-tight">
                {t('about.ctaTitlePrefix')} <br /><span className="text-[#f5a623]">{t('about.ctaTitleSuffix')}</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => setIsContactModalOpen(true)}
                  className="px-8 py-3 bg-[#f5a623] text-black font-semibold text-[14px] rounded-xl hover:bg-[#e09520] transition-colors">
                  {t('contact.sendMessage')}
                </button>
                <Link to="/" className="px-8 py-3 rounded-xl border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14] font-medium text-[14px] transition-colors">
                  {t('common.backToHome')}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default About;
