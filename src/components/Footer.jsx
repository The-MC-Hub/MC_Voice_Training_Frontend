import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Github } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 border-t border-black/8 pt-12 pb-8 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-1.5">
              <span className="text-[18px] font-bold text-gray-900">MC</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-2" />
              <span className="text-[18px] font-bold text-gray-900">Hub</span>
            </Link>
            <p className="text-gray-500 text-[13px] leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Github].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors shadow-sm">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5">{t('footer.platform')}</h4>
            <ul className="space-y-3">
              <li><Link to="/m/search" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.findMC')}</Link></li>
              <li><Link to="/m/scripts" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.scriptLibrary')}</Link></li>
              <li><Link to="/m/learning" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.academy')}</Link></li>
              <li><Link to="/m/dashboard" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.dashboard')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5">{t('footer.support')}</h4>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.helpCenter')}</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.termsOfService')}</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.privacyPolicy')}</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-gray-800 text-[13px] transition-colors">{t('footer.contactUs')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              {[
                { Icon: MapPin, text: "Đà Nẵng, Việt Nam" },
                { Icon: Phone, text: "0912158715" },
                { Icon: Mail, text: "letritrung2605@gmail.com" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-gray-500 text-[13px]">
                  <Icon size={14} className="text-amber-500 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-black/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-gray-400">
            &copy; {new Date().getFullYear()} The MC Hub. {t('footer.rightsReserved')}
          </p>
          <div className="flex items-center gap-5">
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
              {t('footer.status')}: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> {t('footer.operational')}
            </p>
            <p className="text-[11px] text-gray-400">v1.2.0</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
