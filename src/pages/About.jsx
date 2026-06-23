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
import { useTheme } from '../contexts/ThemeContext';
import SpotlightCard from '../components/ui/SpotlightCard';
import mcImage from '../assets/mc.jpg';

const teamMembers = [
  { id: 1, name: "Lê Trí Trung", role: "CEO · Backend Developer", specialty: "BackEnd Developer", image: "/images/trung.jpg", bio: "Kiến trúc hệ thống & dẫn dắt kỹ thuật.", socials: { linkedin: "#", twitter: "#", facebook: "#" } },
  { id: 2, name: "Nguyễn Trọng Tiến Minh", role: "CFO · Business Strategy", specialty: "Business Strategy", image: "/images/minh.jpg", bio: "Chiến lược tài chính & phát triển bền vững.", socials: { linkedin: "#", facebook: "#" } },
  { id: 3, name: "Trần Lê Phương Linh", role: "CPO · Product Design", specialty: "Product Design", image: "/images/linh.jpg", bio: "Thiết kế trải nghiệm người dùng trực quan.", socials: { linkedin: "#", instagram: "#" } },
  { id: 4, name: "Đinh Quang Duy", role: "CMO · Marketing", specialty: "Marketing & Communication", image: "/images/duy.jpg", bio: "Kết nối thương hiệu với cộng đồng MC.", socials: { linkedin: "#", facebook: "#" } },
  { id: 5, name: "Trần Lê Vy", role: "CTO · Frontend Developer", specialty: "Frontend Developer", image: "/images/vy.jpg", bio: "Kiến trúc frontend & đổi mới công nghệ.", socials: { github: "#", linkedin: "#" } },
  { id: 6, name: "Huỳnh Thị Minh Nguyệt", role: "Head of Engineering · Frontend", specialty: "Frontend Developer", image: "/images/nguyet.jpg", bio: "Đảm bảo chất lượng code & quy trình kỹ thuật.", socials: { github: "#", linkedin: "#" } }
];

const SocialIcon = ({ type }) => {
  const icons = { linkedin: Linkedin, github: Github, facebook: Facebook, twitter: Twitter, instagram: Instagram };
  const Icon = icons[type];
  return Icon ? <Icon size={16} /> : null;
};

/* Floating ambient orbs — purely decorative CSS */
const AmbientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Large amber blob top-right */}
    <div className="hidden sm:block absolute -top-32 -right-32 w-125 h-125 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.10) 0%, rgba(245,166,35,0.04) 50%, transparent 70%)', filter: 'blur(40px)' }} />
    {/* Medium blue-ish blob left */}
    <div className="hidden sm:block absolute top-1/3 -left-40 w-100 h-100 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />
    {/* Small amber blob bottom */}
    <div className="absolute bottom-0 right-1/4 w-75 h-75 rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
  </div>
);

/* Dot grid pattern */
const DotGrid = () => (
  <div className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: 'radial-gradient(circle, rgba(245,166,35,0.12) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
      maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
    }} />
);

const About = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="bg-white text-gray-900 min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <AmbientOrbs />
        <DotGrid />

        {/* Decorative rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[360, 500, 640, 780].map((size, i) => (
            <div key={i} className="absolute rounded-full border border-amber-400/[0.07]"
              style={{ width: size, height: size, top: -size/2, left: -size/2, animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal direction="up">
           

            {/* Gradient headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
              {t('about.ourStory').split(' ')[0]}{' '}
              <span className="text-amber-500">{t('about.ourStory').split(' ').slice(1).join(' ')}</span>
            </h1>

            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('about.storyDesc')}
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-10 mx-auto max-w-3xl rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-amber-400/10">
              <img
                src="/images/cover.png"
                onError={e => { e.currentTarget.src = 'https://picsum.photos/seed/mchub-cover/1200/500'; e.currentTarget.onerror = null; }}
                alt="The MC Hub — Cắt tiếng nói, Chạm tương lai"
                className="w-full h-auto object-cover"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Bottom amber gradient fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* Stats bar */}
      <section className="relative py-8 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-amber-50 via-white to-amber-50" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-3 gap-3 sm:gap-8 text-center">
            {[
              { value: '500+', label: 'MCs' },
              { value: '10K+', label: 'Sessions' },
              { value: '94%', label: 'Satisfaction' },
            ].map((stat, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}>
                <p className="text-xl sm:text-3xl font-bold text-amber-500">{stat.value}</p>
                <p className="text-[10px] sm:text-[12px] text-gray-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Large decorative quote mark bg */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[280px] font-black text-amber-500/[0.035] leading-none select-none" style={{ fontFamily: 'Georgia, serif' }}>"</span>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <div className="relative">
              <Quote size={56} className="text-amber-400/20 absolute -top-6 -left-6 lg:-left-10" />
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-800 leading-relaxed max-w-3xl mx-auto relative z-10">
                "{t('about.quote')}"
              </h2>
              <div className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-10 bg-amber-400/40" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{t('about.philosophy')}</span>
                <div className="h-px w-10 bg-amber-400/40" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Section background tint */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-50/60 via-white to-orange-50/30 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-200 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber-200 to-transparent" />

        {/* Corner decorative circles */}
        <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-amber-200/40 pointer-events-none" />
        <div className="absolute top-12 right-12 w-12 h-12 rounded-full border border-amber-300/30 pointer-events-none" />
        <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full border-2 border-amber-200/30 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                {/* Decorative ring behind image */}
                <div className="absolute -inset-4 rounded-[2.5rem] border-2 border-amber-200/30 pointer-events-none" />
                <div className="absolute -inset-8 rounded-[3rem] border border-amber-100/50 pointer-events-none" />

                <div className="aspect-square rounded-3xl overflow-hidden border border-amber-200/30 shadow-xl shadow-amber-100/50 bg-amber-50">
                  <LazyImage src={mcImage} className="w-full h-full object-cover" />
                </div>

                {/* Stats badge */}
                <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-amber-500 p-6 rounded-2xl text-black z-20 shadow-lg shadow-amber-500/30">
                  <div className="text-4xl font-bold mb-0.5">500+</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest">MCs Empowered</div>
                </div>

                {/* Small decorative dot */}
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-amber-400 shadow-md shadow-amber-400/40" />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div>
                {/* Amber left border accent */}
                <div className="border-l-4 border-amber-400 pl-5 mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                    {t('about.whyWeExist').split(' ').slice(0, 2).join(' ')}{' '}
                    <span className="text-amber-500">{t('about.whyWeExist').split(' ').slice(2).join(' ')}</span>
                  </h2>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: <Target size={20} />, color: "text-amber-600 bg-amber-50 border-amber-200", title: t('about.solvingGap'), desc: t('about.solvingGapDesc') },
                    { icon: <Globe size={20} />, color: "text-blue-600 bg-blue-50 border-blue-200", title: t('about.communityImpact'), desc: t('about.communityImpactDesc') },
                    { icon: <Heart size={20} />, color: "text-purple-600 bg-purple-50 border-purple-200", title: t('about.ourPassion'), desc: t('about.ourPassionDesc') },
                  ].map((item, i) => (
                    <SpotlightCard
                      key={i}
                      spotlightColor="rgba(245,166,35,0.08)"
                      spotlightSize={250}
                      className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-100 transition-all duration-300"
                      style={{ opacity: 1 }}
                    >
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${item.color}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-500 text-[13px] leading-relaxed">{item.desc}</p>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(245,166,35,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Large amber blob top */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              {/* Decorative line above title */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-12 bg-amber-400/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="h-px w-12 bg-amber-400/50" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-gray-900">
                {t('about.teamTitlePrefix')}{' '}
                <span className="text-amber-500">{t('about.teamTitleSuffix')}</span>
              </h2>
              <p className="text-gray-500 text-[14px] max-w-xl mx-auto">{t('about.teamDesc')}</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, i) => (
              <ScrollReveal key={member.id} delay={i * 0.08}>
                <SpotlightCard
                  spotlightColor="rgba(245,166,35,0.10)"
                  spotlightSize={300}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-amber-100/60 hover:border-amber-200/60 transition-all duration-300 cursor-default"
                >
                  {/* Top amber accent strip */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-amber-400/60 to-transparent" />

                  {/* Photo */}
                  <div className="relative mx-4 mt-5 overflow-hidden rounded-xl border border-gray-100">
                    <div className="aspect-4/3 overflow-hidden bg-amber-50">
                      <LazyImage
                        src={member.image}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        style={{ filter: 'sepia(0.05) contrast(1.02)' }}
                      />
                    </div>
                    {/* Social hover overlay */}
                    <div className="absolute inset-0 bg-gray-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 rounded-xl">
                      {Object.entries(member.socials).map(([key, link]) => (
                        <a key={key} href={link}
                          className="w-9 h-9 flex items-center justify-center text-white hover:text-amber-400 bg-white/10 hover:bg-amber-400/20 border border-white/20 rounded-lg transition-colors">
                          <SocialIcon type={key} />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-4 pb-5">
                    <p className="text-[10px] text-amber-500 uppercase tracking-wider font-semibold mb-1 truncate">{member.specialty}</p>
                    <h3 className="text-[14px] font-bold text-gray-900 mb-0.5 leading-snug">{member.name}</h3>
                    <p className="text-[11px] text-gray-400 mb-2 leading-snug">{member.role}</p>
                    <p className="text-gray-500 text-[12px] leading-relaxed">{member.bio}</p>
                  </div>

                  {/* Number badge */}
                  <div className="absolute bottom-4 right-4 text-[18px] font-black text-amber-400/25 group-hover:text-amber-400/50 transition-colors" style={{ fontFamily: 'serif' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </SpotlightCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 relative overflow-hidden">
        {/* Amber gradient bg */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-50 via-white to-orange-50 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-300/60 to-transparent" />

        {/* Decorative circles */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-amber-200/40 pointer-events-none" />
        <div className="absolute top-1/2 left-16 -translate-y-1/2 w-16 h-16 rounded-full bg-amber-400/6 pointer-events-none" />
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-amber-200/40 pointer-events-none" />
        <div className="absolute top-1/2 right-16 -translate-y-1/2 w-12 h-12 rounded-full bg-amber-400/6 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <ScrollReveal>
            <SpotlightCard
              spotlightColor="rgba(245,166,35,0.09)"
              spotlightSize={400}
              className="bg-white border border-amber-200/50 rounded-3xl p-12 lg:p-20 text-center shadow-xl shadow-amber-100/40"
            >
              {/* Sparkles decoration */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[11px] font-semibold">
                  <Sparkles size={11} /> Join the Community
                </div>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight text-gray-900">
                {t('about.ctaTitlePrefix')}{' '}
                <br />
                <span className="text-amber-500">{t('about.ctaTitleSuffix')}</span>
              </h2>
              <p className="text-gray-400 text-[14px] mb-8 max-w-md mx-auto">Cùng hàng nghìn MC chuyên nghiệp nâng cao kỹ năng với AI.</p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-8 py-3 bg-amber-500 text-white font-semibold text-[14px] rounded-xl hover:bg-amber-600 transition-colors shadow-md shadow-amber-500/25"
                >
                  {t('contact.sendMessage')}
                </button>
                <Link
                  to="/"
                  className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 font-medium text-[14px] transition-colors"
                >
                  {t('common.backToHome')}
                </Link>
              </div>
            </SpotlightCard>
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
