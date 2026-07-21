import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  LogOut,
  Shield,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Zap,
  Award,
  Briefcase,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Globe,
  Tag,
  History,
  Trash2,
  Key,
  Upload,
  X,
  Loader2,
  MapPin,
  CreditCard,
  Check,
  Gift,
  Copy,

} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { handleUpdateSettings } from "../controllers/authController";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMCProfile } from "../services/publicService";
import { updateMCProfile } from "../services/mcService";
import MCProfileView from "../components/profile/MCProfileView";
import { uploadMedia } from "../services/mediaService";
import api from "../services/api";
import Breadcrumb from '../components/ui/Breadcrumb';
import { useTour } from '../contexts/TourContext';
import { trackSettingsProfileUpdate, trackSettingsAvatarUpload, trackLogoutClick, trackPasswordChangeSubmit } from '@/utils/analytics';
import { questService } from '../services/questService';
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card } from "@/components/ui/card";

const inputCls = "flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none min-w-0";
const inputWrapCls = "flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-amber-400 transition-colors";
const labelCls = "text-[10px] font-medium text-gray-500 uppercase tracking-wider";

const EMOJI_CATEGORIES = [
  {
    label: "Smileys",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"],
  },
  {
    label: "People",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅","👄","💋","🫂","👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","👮","🕵️","💂","🥷","👷","🤴","👸","👳","👲","🧕","🤵","👰","🤰","🤱","👼","🎅","🤶","🦸","🦹","🧙","🧝","🧛","🧟","🧞","🧜","🧚","👨‍⚕️","👩‍⚕️","👨‍🎓","👩‍🎓","👨‍🏫","👩‍🏫","👨‍⚖️","👩‍⚖️","👨‍🌾","👩‍🌾","👨‍🍳","👩‍🍳","👨‍🔧","👩‍🔧","👨‍🏭","👩‍🏭","👨‍💼","👩‍💼","👨‍🔬","👩‍🔬","👨‍🎨","👩‍🎨","👨‍✈️","👩‍✈️","👨‍🚀","👩‍🚀","👨‍🚒","👩‍🚒","🧑‍💻","👨‍💻","👩‍💻"],
  },
  {
    label: "Animals",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪲","🦟","🦗","🪳","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🦭","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔","🐾","🐉","🐲","🌵","🎄","🌲","🌳","🌴","🪵","🌱","🌿","☘️","🍀","🎍","🎋","🍃","🍂","🍁","🍄","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌎","🌍","🌏","🪐","💫","⭐","🌟","✨","⚡","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","🌊","🌈","🌂","☂️","☔","⚓"],
  },
  {
    label: "Food",
    emojis: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🥕","🧄","🧅","🥔","🌽","🍠","🫘","🥜","🍞","🥐","🥖","🫓","🥨","🥯","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫔","🌮","🌯","🥙","🧆","🥚","🍳","🥗","🥘","🫕","🍲","🍜","🍝","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🧃","🥤","🧋","☕","🫖","🍵","🧉","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧊","🥄","🍴","🍽️","🥢","🧂"],
  },
  {
    label: "Travel",
    emojis: ["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🛺","🚲","🛴","🛹","🛼","🚏","🛣️","🛤️","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛟","⛵","🚤","🛥️","🛳️","⛴️","🚢","✈️","🛩️","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛸","🚀","🛶","⛺","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🗾","🎑","⛰️","🏔️","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🏟️","🏛️","🏗️","🧱","🪨","🪵","🛖","🌁","🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🌌","🌠","🎇","🎆","🗺️","🧭"],
  },
  {
    label: "Activities",
    emojis: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🤿","🎿","🛷","🥌","🎯","🪃","🎱","🔮","🪄","🎮","🕹️","🎲","🎭","🎨","🖼️","🎰","🚂","🎠","🎡","🎢","🎪","🤹","🎭","🩰","🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🎸","🪕","🎻","🎙️","🎚️","🎛️","📻","🎵","🎶","🎤","🎧","📢","📣","🔔","🔕","🎵","🎼","🎹","🥁","🎷","🎺","🎸","🎻","🎲","♟️","🎯","🎳","🎮","🕹️","🎰","🧩","🪅","🪆","🎭","🎨","🖼️","🎪","🎤","🎧","🎼","📺","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🧭","⏱️","⏲️","⏰","🕰️","⌛","⏳","📡","🔋","🪫","🔌","💡","🔦","🕯️","🪔"],
  },
  {
    label: "Objects",
    emojis: ["💎","🔑","🗝️","🔒","🔓","🔨","🪓","⛏️","⚒️","🛠️","🗡️","⚔️","🛡️","🪚","🔧","🪛","🔩","⚙️","🗜️","⚖️","🦯","🔗","⛓️","🪝","🧲","🪜","🧰","🧲","🪤","🧯","🛢️","💰","💴","💵","💶","💷","💸","💳","🪙","💹","📈","📉","📊","📋","🗒️","🗓️","📅","📆","🗑️","📁","📂","🗂️","📄","📃","📑","📊","📈","📉","📋","📌","📍","📎","🖇️","📏","📐","✂️","🗃️","🗄️","🗑️","🔒","🔓","🔏","🔐","🔑","🗝️","🔨","🪓","⛏️","🛡️","🔧","🔩","⚙️","🗜️","🔗","🧲","🪜","🪤","🧯","💡","🔦","🕯️","🪔","🧱","🔭","🔬","🩺","💊","🩹","🩼","🩻","🧬","🦠","🧫","🧪","🌡️","🧹","🪣","🧺","🧻","🚽","🚰","🚿","🛁","🪥","🧼","🪒","🧴","🪮","🧽","🧷","🧹","🧺","🧻","🪣","🪠"],
  },
  {
    label: "Symbols",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿","🅿️","🛗","🈳","🈂️","🛂","🛃","🛄","🛅","🚹","🚺","🚼","⚧️","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕","🆓","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","▶️","⏸️","⏹️","⏺️","⏭️","⏮️","⏩","⏪","⏫","⏬","◀️","🔼","🔽","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","🔄","🔃","🎵","🎶","➕","➖","➗","✖️","♾️","💲","💱","™️","©️","®️","〰️","➰","➿","🔚","🔙","🔛","🔝","🔜","✔️","☑️","🔘","🔳","🔲","▪️","▫️","◾","◽","◼️","◻️","🟥","🟧","🟨","🟩","🟦","🟪","⬛","⬜","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔵","🟤","🟠","🟡","🟢","🔴","🔴","⭕","⚫","⚪","🟣"],
  },
];

const EmojiAvatarPicker = ({ selected, onSelect, compact = false }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");

  const displayEmojis = search.trim()
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis)
    : EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('settings.searchEmoji')}
        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
      />

      {/* Category tabs */}
      {!search.trim() && (
        <div className="flex gap-1.5 flex-wrap py-0.5">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <Button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(idx)}
              className={`h-auto px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                activeCategory === idx
                  ? 'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25'
                  : 'text-gray-500 hover:text-gray-700 border border-gray-200 bg-white'
              }`}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className={`${compact ? 'h-40' : 'h-52'} overflow-y-auto rounded-xl bg-gray-50 border border-gray-200 p-2.5`}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1">
          {displayEmojis.map((emoji, i) => {
            const isSelected = selected === emoji;
            return (
              <button
                key={`${emoji}-${i}`}
                type="button"
                onClick={() => onSelect(emoji)}
                title={emoji}
                className={`aspect-square rounded-lg flex items-center justify-center text-xl leading-none transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#f5a623]/15 ring-1 ring-[#f5a623] scale-110'
                    : 'hover:bg-gray-100 hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ReferralCard = ({ user, updateUser }) => {
  const { t } = useTranslation();
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode;
  const referralCount = user?.referralCount ?? 0;
  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : null;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post("/auth/referral-code/generate");
      const code = res.data?.data?.referralCode;
      if (code && updateUser) updateUser({ referralCode: code });
    } catch (err) {
      toast?.error?.(err.response?.data?.message || t('settings.referralGenerateFailed'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Gift size={16} className="text-[#f5a623]" />
        <h2 className="text-[15px] font-semibold text-gray-900">{t('settings.referralCode')}</h2>
      </div>
      <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4 gap-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-gray-500 mb-1">{t('settings.referralCountLabel')}</p>
            <p className="text-[28px] font-bold text-gray-900 leading-none">{referralCount} <span className="text-[14px] font-medium text-gray-400">{t('settings.referralPeopleUnit')}</span></p>
          </div>
          {referralCode && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t('settings.yourCode')}</p>
              <span className="font-mono text-[20px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">{referralCode}</span>
            </div>
          )}
        </div>

        {referralCode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <span className="flex-1 text-[12px] text-gray-600 font-mono truncate">{referralLink}</span>
              <Button
                type="button"
                onClick={handleCopy}
                className={`h-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${copied ? "bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}
              >
                {copied ? <><CheckCircle2 size={12} /> {t('settings.referralCopied')}</> : <><Copy size={12} /> {t('settings.referralCopyLink')}</>}
              </Button>
            </div>
            <p className="text-[11px] text-gray-400">{t('settings.referralShareHint')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[12px] text-gray-500">{t('settings.referralNoCode')}</p>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="h-auto flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
              {generating ? t('settings.referralGenerating') : t('settings.referralGenerateBtn')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const Settings = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { user, updateUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { startTour } = useTour();
  const [showBioPreview, setShowBioPreview] = useState(false);
  const [showPersonalityPreview, setShowPersonalityPreview] = useState(false);

  const sectionRefs = {
    profile: useRef(null),
    security: useRef(null),
    general: useRef(null),
    payment: useRef(null),
  };
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    const observers = [];
    Object.entries(sectionRefs).forEach(([id, ref]) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const [loading, setLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    avatar: (user?.avatar && !user.avatar.includes('.') && !user.avatar.startsWith('http')) ? user.avatar : "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [mcProfileData, setMcProfileData] = useState({
    experience: 0,
    biography: "",
    hostingStyle: "",
    personality: "",
    rates: { min: 0, max: 0 },
    languages: "",
    styles: "",
    eventTypes: "",
    regions: "",
    eventPhotos: []
  });

  React.useEffect(() => {
    const isMC = user?.role?.toLowerCase() === 'mc' || user?.role?.toLowerCase() === 'representative';
    if (isMC && user?.mcProfile) {
      const fetchMCData = async () => {
        try {
          const data = await getMCProfile(user.mcProfile);
          if (data) {
            setMcProfileData({
              experience: data.experience || 0,
              biography: data.biography || "",
              hostingStyle: data.hostingStyle || "",
              personality: data.personality || "",
              rates: data.rates || { min: 0, max: 0 },
              languages: data.languages ? data.languages.join(", ") : "",
              styles: data.styles ? data.styles.join(", ") : "",
              eventTypes: data.eventTypes || [],
              regions: data.regions ? data.regions.join(", ") : "",
              eventPhotos: data.eventPhotos || []
            });
          }
        } catch (err) {
          console.error("Failed to load MC profile:", err);
        }
      };
      fetchMCData();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSecurityChange = (e) => {
    setSecurityData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMCChange = (e) => {
    const { name, value } = e.target;
    if (name === "ratesMin" || name === "ratesMax") {
      const numValue = value === "" ? "" : parseInt(value);
      setMcProfileData(prev => ({
        ...prev,
        rates: { ...prev.rates, [name === "ratesMin" ? "min" : "max"]: numValue }
      }));
    } else {
      setMcProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSliderChange = (e, type) => {
    const value = parseInt(e.target.value);
    setMcProfileData(prev => {
      const newRates = { ...prev.rates };
      if (type === 'min') {
        newRates.min = Math.min(value, prev.rates.max || 100000000);
      } else {
        newRates.max = Math.max(value, prev.rates.min || 0);
      }
      return { ...prev, rates: newRates };
    });
  };

  const addEventPhoto = (url) => {
    if (!url) return;
    setMcProfileData(prev => ({
      ...prev,
      eventPhotos: [...prev.eventPhotos, url]
    }));
  };

  const removeEventPhoto = (index) => {
    setMcProfileData(prev => ({
      ...prev,
      eventPhotos: prev.eventPhotos.filter((_, i) => i !== index)
    }));
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPortfolioLoading(true);
    try {
      const uploadPromises = files.map(file => uploadMedia(file, "portfolios"));
      const urls = await Promise.all(uploadPromises);

      setMcProfileData(prev => ({
        ...prev,
        eventPhotos: [...prev.eventPhotos, ...urls]
      }));
      toast.success(t('settings.portfolioUploadSuccess', { count: urls.length }));
    } catch (err) {
      console.error("Portfolio upload failed:", err);
      toast.error(t('settings.portfolioUploadFailed'));
    } finally {
      setPortfolioLoading(false);
      e.target.value = '';
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const isMC = user?.role?.toLowerCase() === 'mc' || user?.role?.toLowerCase() === 'representative';
      const updateTasks = [handleUpdateSettings(profileData)];

      if (isMC) {
        const mcPayload = {
          ...mcProfileData,
          languages: typeof mcProfileData.languages === 'string' ? mcProfileData.languages.split(",").map(s => s.trim()).filter(Boolean) : mcProfileData.languages,
          styles: typeof mcProfileData.styles === 'string' ? mcProfileData.styles.split(",").map(s => s.trim()).filter(Boolean) : mcProfileData.styles,
          regions: typeof mcProfileData.regions === 'string' ? mcProfileData.regions.split(",").map(s => s.trim()).filter(Boolean) : mcProfileData.regions,
        };
        updateTasks.push(updateMCProfile(mcPayload));
      }

      const results = await Promise.all(updateTasks);

      if (results[0]?.data?.user) {
        updateUser(results[0].data.user);
      }
      setSuccess(t('settings.profileUpdated'));
      trackSettingsProfileUpdate();
      questService.completeQuest('profile').catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || t('settings.failedUpdate'));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      setError(t('settings.passwordMismatchError'));
      return;
    }
    if (securityData.newPassword.length < 6) {
      setError(t('settings.passwordTooShortError'));
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await handleUpdateSettings({ password: securityData.newPassword });
      setSuccess(t('settings.passwordChanged'));
      trackPasswordChangeSubmit();
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || t('settings.failedUpdate'));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const navItems = [
    { id: "profile", label: t('settings.profile'), icon: User },
    { id: "security", label: t('settings.security'), icon: Lock },
    { id: "general", label: t('settings.general'), icon: Globe },
    { id: "payment", label: t('settings.payment'), icon: CreditCard },
  ];

  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    professional: true,
    pricing: true,
    attributes: true,
    portfolio: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isMC = user?.role?.toLowerCase() === 'mc' || user?.role?.toLowerCase() === 'representative';

  const previewMC = {
    ...user,
    name: profileData.name || user?.name || "MC Name",
    verified: user?.isVerified,
    location: mcProfileData.regions || "Vietnam",
    specialties: [],
    styles: mcProfileData.styles ? (typeof mcProfileData.styles === 'string' ? mcProfileData.styles.split(",").map(s => s.trim()).filter(Boolean) : mcProfileData.styles) : ["Professional"],
    biography: mcProfileData.biography || "Your biography will appear here.",
    personality: mcProfileData.personality || "Your personality description.",
    hostingStyle: mcProfileData.hostingStyle || "Your hosting style.",
    experience: mcProfileData.experience || 0,
    rates: mcProfileData.rates || { min: 0, max: 0 },
    languages: mcProfileData.languages ? mcProfileData.languages.split(",").map(s => s.trim()).filter(Boolean) : ["VN", "EN"],
    eventPhotos: mcProfileData.eventPhotos || []
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto px-6">
      <Breadcrumb items={[{ label: t('settings.accountSettings') }]} />
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('settings.accountSettings')}</h1>
        <p className="text-[13px] text-gray-500">{t('settings.manageAccount')}</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl">
          <CheckCircle2 size={16} />
          <span className="text-[13px] font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          <AlertCircle size={16} />
          <span className="text-[13px] font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className=" space-y-1 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              hoverScale={1}
              onClick={() => sectionRefs[item.id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className={`h-auto mt-4 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left justify-start ${
                activeSection === item.id
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <item.icon size={15} className={activeSection === item.id ? 'text-amber-500' : 'text-gray-400'} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Button>
          ))}
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-8">
          {/* Profile Section */}
          <div ref={sectionRefs.profile} id="section-profile" className="scroll-mt-20">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-[#f5a623]" />
                <h2 className="text-[15px] font-semibold text-gray-900">{t('settings.personalInfo')}</h2>
              </div>

              <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden gap-0 p-0">
                {/* Avatar + Fields */}
                <div className="p-6 space-y-5">
                  {/* Avatar row */}
                  <div className="flex items-start gap-5">
                    {/* Current avatar display */}
                    <div className="shrink-0">
                      <p className={labelCls + " mb-2"}>{t('settings.avatarLabel')}</p>
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-[36px] leading-none select-none">
                        {(() => { const a = profileData.avatar || user?.avatar || "🎤"; return (a.includes('.') || a.startsWith('http')) ? "🎤" : a; })()}
                      </div>
                    </div>
                    {/* Picker */}
                    <div className="flex-1 min-w-0" data-quest="quest-avatar-picker">
                      <p className={labelCls + " mb-2"}>{t('settings.chooseEmojiAvatar')}</p>
                      <EmojiAvatarPicker
                        compact
                        selected={(() => { const a = profileData.avatar || user?.avatar || ""; return (a.includes('.') || a.startsWith('http')) ? "" : a; })()}
                        onSelect={(emoji) => { setProfileData(prev => ({ ...prev, avatar: emoji })); trackSettingsAvatarUpload(); }}
                      />
                    </div>
                  </div>

                  {/* Fields row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-gray-100">
                    <div className="space-y-1.5" data-quest="quest-name-input">
                      <label className={labelCls}>{t('settings.displayName')}</label>
                      <div className={inputWrapCls}>
                        <User size={15} className="text-gray-400 shrink-0" />
                        <input type="text" name="name" className={inputCls} value={profileData.name} onChange={handleProfileChange} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>{t('settings.phoneNumber')}</label>
                      <div className={inputWrapCls}>
                        <Phone size={15} className="text-gray-400 shrink-0" />
                        <input type="tel" name="phoneNumber" className={inputCls} value={profileData.phoneNumber} onChange={handleProfileChange} placeholder="+84 9xx xxx xxxx" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>{t('settings.emailAddress')}</label>
                      <div className={`${inputWrapCls} opacity-50`}>
                        <Mail size={15} className="text-gray-400 shrink-0" />
                        <input type="email" name="email" className={`${inputCls} cursor-not-allowed`} value={profileData.email} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

                {isMC && (
                  <>
                    {/* Professional Profile */}
                    <Card className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${expandedSections.professional ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300 gap-0 p-0`}>
                      <button
                        type="button"
                        onClick={() => toggleSection('professional')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2.5">
                          <Briefcase size={16} className="text-[#f5a623]" /> {t('settings.professionalProfile')}
                        </h2>
                        {expandedSections.professional
                          ? <ChevronDown size={16} className="text-gray-400" />
                          : <ChevronRight size={16} className="text-gray-400" />}
                      </button>

                      {expandedSections.professional && (
                        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.yearsExperience')}</label>
                              <div className={inputWrapCls}>
                                <Award size={15} className="text-gray-400 shrink-0" />
                                <input type="number" name="experience" className={inputCls} value={mcProfileData.experience} onChange={handleMCChange} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.baseLocation')}</label>
                              <div className={inputWrapCls}>
                                <MapPin size={15} className="text-gray-400 shrink-0" />
                                <input type="text" name="regions" className={inputCls} value={mcProfileData.regions} onChange={handleMCChange} placeholder="Ho Chi Minh City, Hanoi" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.hostingStyle')}</label>
                              <div className={inputWrapCls}>
                                <Award size={15} className="text-gray-400 shrink-0" />
                                <input type="text" name="hostingStyle" className={inputCls} value={mcProfileData.hostingStyle} onChange={handleMCChange} placeholder="e.g. Energetic, Professional" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className={labelCls}>{t('settings.professionalBiography')}</label>
                              <button
                                type="button"
                                onClick={() => setShowBioPreview(!showBioPreview)}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${showBioPreview ? 'bg-[#f5a623] text-black border-[#f5a623]' : 'text-gray-500 border-gray-200 hover:border-gray-300'}`}
                              >
                                {showBioPreview ? 'Edit' : 'Preview'}
                              </button>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2.5 focus-within:border-amber-400 transition-colors">
                              <User size={15} className="text-gray-400 mt-0.5 shrink-0" />
                              {showBioPreview ? (
                                <div className="w-full min-h-[120px] text-gray-700 prose prose-xs max-w-none overflow-y-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mcProfileData.biography || "*No biography provided yet.*"}</ReactMarkdown>
                                </div>
                              ) : (
                                <textarea name="biography" className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none resize-y min-h-[120px]" value={mcProfileData.biography} onChange={handleMCChange} placeholder="Tell clients about yourself using markdown..." />
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className={labelCls}>{t('settings.personality')}</label>
                              <button
                                type="button"
                                onClick={() => setShowPersonalityPreview(!showPersonalityPreview)}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${showPersonalityPreview ? 'bg-[#f5a623] text-black border-[#f5a623]' : 'text-gray-500 border-gray-200 hover:border-gray-300'}`}
                              >
                                {showPersonalityPreview ? 'Edit' : 'Preview'}
                              </button>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start gap-2.5 focus-within:border-amber-400 transition-colors">
                              <Zap size={15} className="text-gray-400 mt-0.5 shrink-0" />
                              {showPersonalityPreview ? (
                                <div className="w-full min-h-[80px] text-gray-700 prose prose-xs max-w-none overflow-y-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mcProfileData.personality || "*No personality description provided.*"}</ReactMarkdown>
                                </div>
                              ) : (
                                <textarea name="personality" className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 focus:outline-none resize-y min-h-[80px]" value={mcProfileData.personality} onChange={handleMCChange} placeholder="Describe your personality using markdown..." />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Attributes */}
                    <Card className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${expandedSections.attributes ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300 gap-0 p-0`}>
                      <button
                        type="button"
                        onClick={() => toggleSection('attributes')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2.5">
                          <Tag size={16} className="text-[#f5a623]" /> {t('settings.skillsAttributes')}
                        </h2>
                        {expandedSections.attributes
                          ? <ChevronDown size={16} className="text-gray-400" />
                          : <ChevronRight size={16} className="text-gray-400" />}
                      </button>

                      {expandedSections.attributes && (
                        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                          <div className="pt-4 space-y-1.5">
                            <label className={labelCls}>{t('settings.languagesComma')}</label>
                            <div className={inputWrapCls}>
                              <Globe size={15} className="text-gray-400 shrink-0" />
                              <input type="text" name="languages" className={inputCls} value={mcProfileData.languages} onChange={handleMCChange} placeholder="English, Vietnamese" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.stylesComma')}</label>
                              <div className={inputWrapCls}>
                                <CheckCircle2 size={15} className="text-gray-400 shrink-0" />
                                <input type="text" name="styles" className={inputCls} value={mcProfileData.styles} onChange={handleMCChange} placeholder="Humorous, Formal" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Pricing */}
                    <Card className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${expandedSections.pricing ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300 gap-0 p-0`}>
                      <button
                        type="button"
                        onClick={() => toggleSection('pricing')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2.5">
                          <DollarSign size={16} className="text-[#f5a623]" /> {t('settings.ratesPricing')}
                        </h2>
                        {expandedSections.pricing
                          ? <ChevronDown size={16} className="text-gray-400" />
                          : <ChevronRight size={16} className="text-gray-400" />}
                      </button>

                      {expandedSections.pricing && (
                        <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
                          <div className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <label className={labelCls}>{t('settings.rangeVnd')}</label>
                              <div className="text-amber-600 text-[13px] font-semibold flex gap-2">
                                <span>{(mcProfileData.rates.min || 0).toLocaleString('vi-VN')}đ</span>
                                <span className="text-gray-300">–</span>
                                <span>{(mcProfileData.rates.max || 0).toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>

                            <div className="relative h-10 flex items-center">
                              <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
                              <div
                                className="absolute h-1.5 bg-amber-400 rounded-full"
                                style={{
                                  left: `${((mcProfileData.rates.min || 0) / 100000000) * 100}%`,
                                  right: `${100 - ((mcProfileData.rates.max || 0) / 100000000) * 100}%`
                                }}
                              ></div>
                              <input
                                type="range"
                                min="0"
                                max="100000000"
                                step="1000000"
                                value={mcProfileData.rates.min || 0}
                                onChange={(e) => handleSliderChange(e, 'min')}
                                className="absolute w-full appearance-none bg-transparent pointer-events-none z-20 mchub-range-slider"
                              />
                              <input
                                type="range"
                                min="0"
                                max="100000000"
                                step="1000000"
                                value={mcProfileData.rates.max || 0}
                                onChange={(e) => handleSliderChange(e, 'max')}
                                className="absolute w-full appearance-none bg-transparent pointer-events-none z-[21] mchub-range-slider"
                              />
                              <style dangerouslySetInnerHTML={{
                                __html: `
                                .mchub-range-slider::-webkit-slider-thumb {
                                  appearance: none;
                                  pointer-events: auto;
                                  width: 20px;
                                  height: 20px;
                                  background: #f5a623;
                                  border: 3px solid #ffffff;
                                  border-radius: 50%;
                                  cursor: pointer;
                                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                  transition: transform 0.15s;
                                }
                                .mchub-range-slider::-webkit-slider-thumb:hover {
                                  transform: scale(1.15);
                                }
                                .mchub-range-slider::-moz-range-thumb {
                                  pointer-events: auto;
                                  width: 20px;
                                  height: 20px;
                                  background: #f5a623;
                                  border: 3px solid #ffffff;
                                  border-radius: 50%;
                                  cursor: pointer;
                                  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                }
                              `}} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.minRate')}</label>
                              <div className={inputWrapCls}>
                                <DollarSign size={15} className="text-gray-400 shrink-0" />
                                <input type="number" name="ratesMin" className={inputCls} value={mcProfileData.rates.min} onChange={handleMCChange} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.maxRate')}</label>
                              <div className={inputWrapCls}>
                                <DollarSign size={15} className="text-gray-400 shrink-0" />
                                <input type="number" name="ratesMax" className={inputCls} value={mcProfileData.rates.max} onChange={handleMCChange} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Event Portfolio */}
                    <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm gap-0 p-0">
                      <button
                        type="button"
                        onClick={() => toggleSection('portfolio')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2.5">
                          <Camera size={16} className="text-[#f5a623]" /> {t('settings.eventPortfolio')}
                        </h2>
                        {expandedSections.portfolio
                          ? <ChevronDown size={16} className="text-gray-400" />
                          : <ChevronRight size={16} className="text-gray-400" />}
                      </button>

                      {expandedSections.portfolio && (
                        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                          <div className="pt-4">
                            <label className={`${labelCls} block mb-3`}>{t('settings.portfolioHighlights')}</label>
                            <label className={`
                              flex flex-col items-center justify-center w-full min-h-[140px]
                              rounded-xl border border-dashed border-gray-200 transition-colors cursor-pointer
                              ${portfolioLoading ? 'bg-amber-50' : 'bg-gray-50 hover:border-gray-300 hover:bg-gray-100'}
                            `}>
                              <div className="flex flex-col items-center text-center px-6 py-4">
                                {portfolioLoading ? (
                                  <>
                                    <Loader2 size={32} className="text-amber-500 animate-spin mb-3" />
                                    <p className="text-[12px] font-medium text-amber-600">{t('settings.uploading')}</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-3 text-amber-600">
                                      <Upload size={22} />
                                    </div>
                                    <p className="text-[13px] font-medium text-gray-800 mb-1">{t('settings.uploadEventPhotos')}</p>
                                    <p className="text-[11px] text-gray-400">{t('settings.dragDropPhotos')}</p>
                                  </>
                                )}
                              </div>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handlePortfolioUpload}
                                disabled={portfolioLoading}
                              />
                            </label>
                          </div>

                          {mcProfileData.eventPhotos.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {mcProfileData.eventPhotos.map((photo, index) => (
                                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                                  <img src={photo} alt={`Event ${index}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeEventPhoto(index)}
                                      className="p-2 bg-red-500 rounded-lg text-white"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  </>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    data-quest="quest-save-profile"
                    className="h-auto flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={15} /> {loading ? t('settings.saving') : t('settings.saveAllChanges')}
                  </Button>
                </div>
            </form>
          </div>

          {/* Referral Section */}
          <ReferralCard user={user} updateUser={updateUser} />

          {/* General Section */}
          <div ref={sectionRefs.general} id="section-general" className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={16} className="text-[#f5a623]" />
              <h2 className="text-[15px] font-semibold text-gray-900">{t('settings.general')}</h2>
            </div>
            <Card className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3 gap-0">
                {/* Replay tour */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{t('settings.userGuideTitle')}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t('settings.userGuideDesc')}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("mcvt_tour_done");
                      startTour();
                    }}
                    className="h-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[12px] font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <History size={13} />
                    {t('settings.reviewGuideBtn')}
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-[13px] font-medium text-gray-800">{t('settings.interfaceLanguage')}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t('settings.interfaceLanguageDesc')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="bg-gray-100 border border-gray-200 rounded-xl p-1 flex items-center gap-1">
                      <Button
                        type="button"
                        onClick={() => i18nInstance.changeLanguage('vi')}
                        className={`h-auto px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          i18nInstance.language === 'vi'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        VI
                      </Button>
                      <Button
                        type="button"
                        onClick={() => i18nInstance.changeLanguage('en')}
                        className={`h-auto px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          i18nInstance.language === 'en'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        EN
                      </Button>
                      <Button
                        type="button"
                        onClick={() => i18nInstance.changeLanguage('ja')}
                        className={`h-auto px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          i18nInstance.language === 'ja'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        JA
                      </Button>
                    </div>
                  </div>
                </div>
            </Card>
          </div>

          {/* Security Section */}
          <div ref={sectionRefs.security} id="section-security" className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-[#f5a623]" />
              <h2 className="text-[15px] font-semibold text-gray-900">{t('settings.security')}</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
              {/* Password form */}
              <form onSubmit={handlePasswordChange} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <p className="text-[13px] font-medium text-gray-800">{t('settings.changePassword')}</p>
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('settings.currentPassword')}</label>
                  <div className={inputWrapCls}>
                    <Lock size={15} className="text-gray-400 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      className={inputCls}
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                      placeholder="••••••••"
                    />
                    <Button type="button" onClick={() => setShowPassword(!showPassword)} className="h-auto p-0 bg-transparent text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>{t('settings.newPassword')}</label>
                    <div className={inputWrapCls}>
                      <Shield size={15} className="text-gray-400 shrink-0" />
                      <input type="password" name="newPassword" className={inputCls} value={securityData.newPassword} onChange={handleSecurityChange} placeholder={t('settings.minCharacters')} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>{t('settings.confirmNewPassword')}</label>
                    <div className={inputWrapCls}>
                      <Shield size={15} className="text-gray-400 shrink-0" />
                      <input type="password" name="confirmPassword" className={inputCls} value={securityData.confirmPassword} onChange={handleSecurityChange} placeholder={t('settings.repeatPassword')} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1 border-t border-gray-100">
                  <Button type="submit" disabled={loading} className="h-auto flex items-center gap-2 px-5 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50">
                    <Save size={14} /> {loading ? t('settings.saving') : t('settings.updatePassword')}
                  </Button>
                </div>
              </form>

              {/* Session + Danger Zone */}
              <Card className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm gap-0">
                {/* Header */}
                <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
                  <LogOut size={13} className="text-red-500" />
                  <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">{t('settings.sessionLabel')}</p>
                </div>
                {/* Logout row */}
                <div className="p-5 flex flex-col items-start gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800">{t('settings.logoutFromAccount')}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{t('settings.logoutDesc')}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => { trackLogoutClick(); logout(); navigate('/'); }}
                    className="h-auto shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold transition-all duration-150"
                  >
                    <LogOut size={13} /> {t('navbar.logout')}
                  </Button>
                </div>
              </Card>
            </div>
          </div>


          {/* Payment Section */}
          <div ref={sectionRefs.payment} id="section-payment" className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-[#f5a623]" />
              <h2 className="text-[15px] font-semibold text-gray-900">{t('settings.payment')}</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                {user?.isPremium ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                      <Award size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">{t('settings.planActive', { plan: user?.plan || 'Premium' })}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {user?.planExpiresAt ? t('settings.planExpiresAt', { date: new Date(user.planExpiresAt).toLocaleDateString('vi-VN') }) : t('settings.planUnlimited')}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-400">{t('settings.planActiveLabel')}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* FREE plan info */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                        <Zap size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900">{t('settings.freePlanTitle')}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{t('settings.freePlanDesc')}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase tracking-wide">{t('settings.freePlanBadge')}</span>
                    </div>

                    {/* FREE benefits */}
                    <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                      <div className="px-4 py-2.5 bg-gray-50">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('settings.currentBenefits')}</p>
                      </div>
                      {[
                        { label: t('settings.benefitAiSessions'), used: user?.aiSessionsUsed ?? 0, total: 5, unit: t('settings.benefitSessionsUnit') },
                        { label: t('settings.benefitLessonsAccess'), used: null, total: null, note: t('settings.benefitLessonsNote') },
                        { label: t('settings.benefitAiCoaching'), used: null, total: null, note: t('settings.benefitUnavailable') },
                        { label: t('settings.benefitPracticeTopics'), used: null, total: null, note: t('settings.benefitTopicsNote') },
                      ].map(({ label, used, total, unit, note }) => (
                        <div key={label} className="flex items-center justify-between px-4 py-3">
                          <span className="text-[12px] text-gray-600">{label}</span>
                          {total !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-amber-400"
                                  style={{ width: `${Math.min(100, (used / total) * 100)}%` }}
                                />
                              </div>
                              <span className={`text-[11px] font-semibold tabular-nums ${used >= total ? 'text-red-500' : 'text-gray-700'}`}>
                                {t('settings.benefitRemaining', { count: total - used, unit })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">{note}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Upgrade CTA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 mb-0.5">{t('settings.upgradeToUnlockTitle')}</p>
                        <p className="text-[11px] text-gray-500">{t('settings.upgradeToUnlockDesc')}</p>
                      </div>
                      <Button
                        onClick={() => navigate('/m/payment')}
                        className="h-auto shrink-0 px-5 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black text-[13px] font-semibold rounded-xl transition-colors"
                      >
                        {t('settings.viewPlans')}
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Settings;
