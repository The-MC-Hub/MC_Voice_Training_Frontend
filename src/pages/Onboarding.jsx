import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  User, Briefcase, MapPin, Camera, Video, ArrowRight, ArrowLeft,
  ShieldCheck, Zap, CheckCircle2, Lock, Globe, CreditCard,
  TrendingUp, ChevronDown, Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../controllers/mcController";
import { uploadMedia } from "../services/mediaService";
import { trackOnboardingStepComplete, trackOnboardingSubmit } from '@/utils/analytics';
import { Button } from "@/components/animate-ui/components/buttons/button";

const inputCls = "w-full bg-[#09090b] border border-white/[0.07] rounded-xl py-3 px-4 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-white/[0.14] transition-colors";

const Onboarding = () => {
  const { t } = useTranslation();
  const fileInputRef = React.useRef(null);
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    stageName: "", city: "Ho Chi Minh City, VN", specialty: [],
    showreelFiles: [], avatar: "", biography: "", personality: "",
    hostingStyle: "", experience: 0,
    socialLinks: { instagram: "", facebook: "", youtube: "" }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("Vietnam");
  const [locLoading, setLocLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchCountry, setSearchCountry] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries")
      .then(res => res.json())
      .then(result => { if (!result.error) setCountries(result.data.map(c => c.country).sort()); });
  }, []);

  React.useEffect(() => {
    if (selectedCountry) {
      setLocLoading(true);
      fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry })
      })
        .then(res => res.json())
        .then(result => {
          if (!result.error) {
            setCities(result.data.sort());
            if (result.data.length > 0) setProfileData(prev => ({ ...prev, city: `${result.data[0]}, ${selectedCountry}` }));
          }
          setLocLoading(false);
        });
    }
  }, [selectedCountry]);

  const handleComplete = async () => {
    trackOnboardingSubmit();
    try {
      let uploadedPortfolioUrls = [];
      if (profileData.showreelFiles.length > 0) {
        uploadedPortfolioUrls = await Promise.all(profileData.showreelFiles.map(file => uploadMedia(file, "portfolios")));
      }
      await updateProfile({
        experience: profileData.experience || 0,
        biography: profileData.biography,
        personality: profileData.personality,
        hostingStyle: profileData.hostingStyle,
        regions: [profileData.city],
        eventPhotos: uploadedPortfolioUrls,
      });
      if (profileData.stageName) {
        const { handleUpdateSettings } = await import("../controllers/authController");
        await handleUpdateSettings({ name: profileData.stageName, avatar: profileData.avatar });
      }
      navigate("/m/dashboard");
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const labelCls = "text-[11px] font-medium text-zinc-500 uppercase tracking-wider";

  const DropdownMenu = ({ items, onSelect, selectedValue, searchVal, onSearchChange, placeholder, loading }) => (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111113] border border-white/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[100] overflow-hidden">
      <div className="p-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 bg-[#09090b] rounded-lg px-3 py-1.5 border border-white/[0.06] focus-within:border-white/[0.14] transition-colors">
          <Search size={13} className="text-zinc-600" />
          <input type="text" className="bg-transparent border-none outline-none w-full text-[13px] text-white placeholder:text-zinc-700"
            placeholder={placeholder} value={searchVal} onChange={(e) => onSearchChange(e.target.value)}
            onClick={(e) => e.stopPropagation()} autoFocus />
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {items.map(item => (
          <div key={item} onClick={() => { onSelect(item); onSearchChange(""); }}
            className={`px-4 py-2.5 text-[13px] cursor-pointer transition-colors hover:bg-white/[0.04] hover:text-white ${selectedValue === item || (typeof selectedValue === 'string' && selectedValue.startsWith(item)) ? 'text-[#f5a623]' : 'text-zinc-400'}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 bg-[#09090b]">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/[0.07]">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('onboarding.welcomeHub').split('Hub Stage')[0]}<span className="text-[#f5a623]">Hub Stage</span>
            </h1>
            <p className="text-zinc-500 text-[13px]">{t('onboarding.setupDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-all ${
                step === num ? "bg-[#f5a623] text-black border-[#f5a623]" :
                step > num ? "bg-emerald-500 text-white border-emerald-500" :
                "bg-[#111113] text-zinc-600 border-white/[0.07]"
              }`}>
                {step > num ? <CheckCircle2 size={13} /> : num}
              </div>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center">
                  <User size={20} className="text-black" />
                </div>
                <h2 className="text-[17px] font-semibold text-white">{t('onboarding.personalPresence')}</h2>
              </div>

              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3 pb-4">
                <div className="relative group cursor-pointer">
                  <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors bg-[#111113] ${profileData.avatar ? 'border-[#f5a623]/50' : 'border-white/[0.1] group-hover:border-[#f5a623]/30'}`}>
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-600 group-hover:text-[#f5a623] transition-colors">
                        <Camera size={24} />
                        <span className="text-[9px] uppercase tracking-wider">{t('onboarding.addPhoto')}</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try { const url = await uploadMedia(file, "avatars"); setProfileData(prev => ({ ...prev, avatar: url })); }
                        catch (err) { console.error("Avatar upload failed:", err); }
                      }
                    }} />
                </div>
                <p className="text-[11px] text-zinc-600">{t('onboarding.profilePhoto')} — PNG, JPG, WebP (Max 5MB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('onboarding.stageNameLabel')}</label>
                  <input type="text" className={inputCls} placeholder={t('onboarding.enterStageName')}
                    value={profileData.stageName} onChange={(e) => setProfileData(prev => ({ ...prev, stageName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('onboarding.yearsExp')}</label>
                  <input type="number" className={inputCls} placeholder="0"
                    value={profileData.experience} onChange={(e) => setProfileData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('onboarding.hostingStyle')}</label>
                  <input type="text" className={inputCls} placeholder="e.g. Energetic, Professional"
                    value={profileData.hostingStyle} onChange={(e) => setProfileData(prev => ({ ...prev, hostingStyle: e.target.value }))} />
                </div>

                {/* Country dropdown */}
                <div className="space-y-1.5 relative">
                  <label className={labelCls}>{t('onboarding.country')}</label>
                  <div onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
                    className="flex items-center justify-between bg-[#09090b] border border-white/[0.07] rounded-xl px-4 py-3 cursor-pointer hover:border-white/[0.14] transition-colors">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-[#f5a623]" />
                      <span className="text-[14px] text-white">{selectedCountry}</span>
                    </div>
                    <ChevronDown size={15} className={`text-zinc-600 transition-transform ${openDropdown === 'country' ? 'rotate-180' : ''}`} />
                  </div>
                  {openDropdown === 'country' && (
                    <DropdownMenu
                      items={countries.filter(c => c.toLowerCase().includes(searchCountry.toLowerCase()))}
                      onSelect={(c) => { setSelectedCountry(c); setOpenDropdown(null); }}
                      selectedValue={selectedCountry}
                      searchVal={searchCountry}
                      onSearchChange={setSearchCountry}
                      placeholder={t('onboarding.searchCountry')}
                    />
                  )}
                </div>

                {/* City dropdown */}
                <div className="space-y-1.5 relative">
                  <label className={labelCls}>{t('onboarding.baseCity')}</label>
                  <div onClick={() => !locLoading && setOpenDropdown(openDropdown === 'city' ? null : 'city')}
                    className={`flex items-center justify-between bg-[#09090b] border border-white/[0.07] rounded-xl px-4 py-3 cursor-pointer hover:border-white/[0.14] transition-colors ${locLoading ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#f5a623]" />
                      <span className="text-[14px] text-white">{profileData.city.split(', ')[0]}</span>
                    </div>
                    {locLoading
                      ? <div className="w-4 h-4 border-2 border-[#f5a623]/30 border-t-[#f5a623] rounded-full animate-spin" />
                      : <ChevronDown size={15} className={`text-zinc-600 transition-transform ${openDropdown === 'city' ? 'rotate-180' : ''}`} />
                    }
                  </div>
                  {openDropdown === 'city' && (
                    <DropdownMenu
                      items={cities.filter(c => c.toLowerCase().includes(searchCity.toLowerCase()))}
                      onSelect={(c) => { setProfileData(prev => ({ ...prev, city: `${c}, ${selectedCountry}` })); setOpenDropdown(null); }}
                      selectedValue={profileData.city}
                      searchVal={searchCity}
                      onSearchChange={setSearchCity}
                      placeholder={t('onboarding.searchCity')}
                    />
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>{t('onboarding.proBio')}</label>
                  <textarea className={`${inputCls} min-h-[100px] resize-y`} placeholder={t('onboarding.journeyDesc')}
                    value={profileData.biography} onChange={(e) => setProfileData(prev => ({ ...prev, biography: e.target.value }))} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>{t('onboarding.personality')}</label>
                  <textarea className={`${inputCls} min-h-[80px] resize-y`} placeholder={t('onboarding.personalityDesc')}
                    value={profileData.personality} onChange={(e) => setProfileData(prev => ({ ...prev, personality: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center">
                  <Video size={20} className="text-black" />
                </div>
                <h2 className="text-[17px] font-semibold text-white">{t('onboarding.performancePortfolio')}</h2>
              </div>

              <div onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault(); setIsDragging(false);
                  const newFiles = Array.from(e.dataTransfer.files);
                  if (newFiles.length > 0) setProfileData(prev => ({ ...prev, showreelFiles: [...(prev.showreelFiles || []), ...newFiles] }));
                }}
                className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${isDragging ? "border-[#f5a623] bg-[#f5a623]/[0.04]" : "border-white/[0.1] hover:border-[#f5a623]/30 hover:bg-[#f5a623]/[0.02]"}`}
              >
                <input ref={fileInputRef} type="file" className="hidden" multiple accept="video/*,image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files);
                    if (newFiles.length > 0) setProfileData(prev => ({ ...prev, showreelFiles: [...(prev.showreelFiles || []), ...newFiles] }));
                  }} />
                <div className="w-10 h-10 rounded-xl bg-[#f5a623] flex items-center justify-center">
                  <Video size={18} className="text-black" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-white">{t('onboarding.addToPortfolio')}</p>
                  <p className="text-[11px] text-zinc-600">{t('onboarding.dragDropClips')}</p>
                </div>
              </div>

              {profileData.showreelFiles?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {profileData.showreelFiles.map((file, idx) => {
                    const isImg = file.type.startsWith('image/');
                    return (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/[0.07] group bg-[#111113]">
                        {isImg ? (
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                            <Video size={24} className="text-[#f5a623]" />
                            <span className="text-[10px] text-zinc-600 px-2 truncate w-full text-center">{file.name}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button onClick={(e) => { e.stopPropagation(); setProfileData(prev => ({ ...prev, showreelFiles: prev.showreelFiles.filter((_, i) => i !== idx) })); }}
                            className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors h-auto">
                            <Zap size={14} fill="currentColor" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: t('onboarding.instagramProfile'), icon: <TrendingUp size={14} />, key: 'instagram', placeholder: '@nathan_mc_pro' },
                  { label: t('onboarding.facebookFanpage'), icon: <Globe size={14} />, key: 'facebook', placeholder: 'fb.com/mc_nathan' },
                  { label: t('onboarding.youtubeChannel'), icon: <Video size={14} />, key: 'youtube', placeholder: 'Stage Vibe Channel' },
                ].map(({ label, icon, key, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className={labelCls}>{label}</label>
                    <div className="flex items-center gap-2 bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-white/[0.14] transition-colors">
                      <span className="text-[#f5a623]">{icon}</span>
                      <input type="text" className="bg-transparent border-none outline-none w-full text-[13px] text-white placeholder:text-zinc-700"
                        placeholder={placeholder} value={profileData.socialLinks[key]}
                        onChange={(e) => setProfileData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: e.target.value } }))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#f5a623] rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} className="text-black" />
                </div>
                <h2 className="text-[17px] font-semibold text-white">{t('onboarding.escrowVerification')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    icon: <Briefcase size={18} />,
                    title: t('onboarding.identityCheck'),
                    desc: t('onboarding.kycDesc'),
                    btnLabel: t('onboarding.uploadIdDoc'),
                    btnIcon: <Lock size={14} />,
                    badge: <><CheckCircle2 size={11} /> <span>{t('onboarding.secureStorage')}</span></>,
                    badgeCls: "text-emerald-400 bg-emerald-500/[0.06] border-emerald-500/20",
                  },
                  {
                    icon: <Briefcase size={18} />,
                    title: t('onboarding.bankDetails'),
                    desc: t('onboarding.bankDesc'),
                    btnLabel: t('onboarding.connectBank'),
                    btnIcon: <CreditCard size={14} />,
                    badge: <><ShieldCheck size={11} /> <span>{t('onboarding.privacyGuaranteed')}</span></>,
                    badgeCls: "text-zinc-500 bg-[#09090b] border-white/[0.06]",
                  },
                ].map((card, i) => (
                  <div key={i} className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 hover:border-[#f5a623]/20 transition-colors group space-y-4">
                    <h3 className="text-[14px] font-semibold text-white group-hover:text-[#f5a623] transition-colors flex items-center gap-2">
                      <span className="text-[#f5a623]">{card.icon}</span> {card.title}
                    </h3>
                    <p className="text-[13px] text-zinc-500 leading-relaxed">{card.desc}</p>
                    <Button hoverScale={1} className="w-full py-2.5 rounded-xl border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors h-auto">
                      {card.btnIcon} {card.btnLabel}
                    </Button>
                    <div className={`flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg border w-max ${card.badgeCls}`}>
                      {card.badge}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/[0.07]">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/[0.14] text-[13px] font-medium transition-colors h-auto">
                <ArrowLeft size={15} /> {t('common.back')}
              </Button>
            )}
            <Button onClick={() => { if (step < 3) { setStep(step + 1); trackOnboardingStepComplete(step); } else handleComplete(); }}
              className="text-zinc-600 hover:text-zinc-400 text-[13px] transition-colors px-2 h-auto">
              {t('onboarding.skip')}
            </Button>
          </div>

          {step < 3 ? (
            <Button onClick={() => { setStep(step + 1); trackOnboardingStepComplete(step); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] text-black text-[13px] font-semibold rounded-xl hover:bg-[#e09520] transition-colors h-auto">
              {t('onboarding.continueStep')} {step} <ArrowRight size={15} />
            </Button>
          ) : (
            <Button onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] text-black text-[13px] font-semibold rounded-xl hover:bg-[#e09520] transition-colors h-auto">
              {t('onboarding.finishDashboard')} <Zap size={15} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
