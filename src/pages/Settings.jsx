import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  LogOut,
  Bell,
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
  Moon,
  Sun,
  Monitor,
  Award,
  Briefcase,
  Languages,
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
  Sparkles,
  Copy,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/Toast";
import { handleUpdateSettings } from "../controllers/authController";
import * as notificationController from "../controllers/notificationController";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMCProfile } from "../services/publicService";
import { updateMCProfile } from "../services/mcService";
import MCProfileView from "../components/profile/MCProfileView";
import { uploadMedia } from "../services/mediaService";
import api from "../services/api";

const inputCls = "flex-1 bg-transparent text-[13px] text-white placeholder:text-zinc-600 focus:outline-none min-w-0";
const inputWrapCls = "flex items-center gap-2 bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2.5 focus-within:border-white/[0.14] transition-colors";
const labelCls = "text-[10px] font-medium text-zinc-500 uppercase tracking-wider";

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
        placeholder="Tìm emoji..."
        className="w-full bg-[#09090b] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[12px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
      />

      {/* Category tabs */}
      {!search.trim() && (
        <div className="flex gap-1.5 flex-wrap py-0.5">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setActiveCategory(idx)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                activeCategory === idx
                  ? 'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25'
                  : 'text-zinc-500 hover:text-zinc-300 border border-white/[0.06] bg-[#09090b]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className={`${compact ? 'h-40' : 'h-52'} overflow-y-auto rounded-xl bg-[#09090b] border border-white/[0.07] p-2.5`}>
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
                    : 'hover:bg-white/[0.07] hover:scale-105'
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

const Settings = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [showBioPreview, setShowBioPreview] = useState(false);
  const [showPersonalityPreview, setShowPersonalityPreview] = useState(false);

  const sectionRefs = {
    profile: useRef(null),
    security: useRef(null),
    general: useRef(null),
    notifications: useRef(null),
    payment: useRef(null),
  };
  const [activeSection, setActiveSection] = useState("profile");

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

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [copiedMemo, setCopiedMemo] = useState(false);

  const fetchOrder = async () => {
    if (!user?.id) return;
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await api.post(`/payment/create-order?userId=${user.id}`);
      setPaymentOrder(res.data.data);
    } catch (err) {
      console.error("Failed to generate settings checkout details:", err);
      setPaymentError("Unable to initialize payment details. Please check server status.");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !user?.isPremium) fetchOrder();
  }, [user?.id, user?.isPremium]);
  const [loading, setLoading] = useState(false);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    avatar: user?.avatar || "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifPrefs, setNotifPrefs] = useState({
    emailMessages: true,
    emailPayments: true,
    pushMessages: false,
    pushMarketing: false,
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
      toast(`Successfully uploaded ${urls.length} photos`, "success");
    } catch (err) {
      console.error("Portfolio upload failed:", err);
      toast("Failed to upload some photos", "error");
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
      setError("New passwords do not match.");
      return;
    }
    if (securityData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await handleUpdateSettings({ password: securityData.newPassword });
      setSuccess(t('settings.passwordChanged'));
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || t('settings.failedUpdate'));
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const categories = [
    {
      label: "account",
      items: [
        { id: "profile", label: "profile", icon: User },
        { id: "security", label: "security", icon: Lock },
      ],
    },
    {
      label: "preferences",
      items: [
        { id: "general", label: "general", icon: Globe },
        { id: "notifications", label: "notifications", icon: Bell },
      ],
    },
    {
      label: "billing",
      items: [
        { id: "payment", label: "payment", icon: CreditCard },
      ],
    },
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
    avatar: profileData.avatar || user?.avatar || "/placeholder.jpg",
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
      <div className="border-b border-white/[0.07] pb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{t('settings.accountSettings')}</h1>
        <p className="text-[13px] text-zinc-500">{t('settings.manageAccount')}</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
          <CheckCircle2 size={16} />
          <span className="text-[13px] font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          <AlertCircle size={16} />
          <span className="text-[13px] font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          {categories.map((category, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-3 mb-2">
                {t(`settings.${category.label.toLowerCase()}`)}
              </h3>
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sectionRefs[item.id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                    activeSection === item.id
                      ? 'bg-[#f5a623]/[0.08] text-[#f5a623] border border-[#f5a623]/20'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <item.icon size={15} className={activeSection === item.id ? 'text-[#f5a623]' : 'text-zinc-600'} />
                  <span className="text-[13px] font-medium">{t(`settings.${item.id}`)}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <div className="min-w-0 space-y-8">
          {/* Profile Section */}
          <div ref={sectionRefs.profile} id="section-profile" className="scroll-mt-20">
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-[#f5a623]" />
                <h2 className="text-[15px] font-semibold text-white">{t('settings.personalInfo')}</h2>
              </div>

              <div className="bg-[#111113] border border-white/10 rounded-2xl shadow-sm overflow-hidden">
                {/* Avatar section */}
                <div className="p-6 border-b border-white/[0.07]">
                  <label className={labelCls + " mb-3 block"}>Ảnh đại diện</label>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#09090b] border border-white/10 flex items-center justify-center text-[2rem] leading-none shrink-0">
                      {profileData.avatar || "🙂"}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white leading-snug">
                        {profileData.avatar ? "Đã chọn" : "Chưa chọn"}
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Chọn emoji bên dưới</p>
                    </div>
                  </div>
                  <EmojiAvatarPicker
                    selected={profileData.avatar}
                    onSelect={(emoji) => setProfileData(prev => ({ ...prev, avatar: emoji }))}
                    compact
                  />
                </div>

                {/* Fields section */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className={labelCls}>{t('settings.displayName')}</label>
                    <div className={inputWrapCls}>
                      <User size={15} className="text-zinc-600 shrink-0" />
                      <input type="text" name="name" className={inputCls} value={profileData.name} onChange={handleProfileChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>{t('settings.phoneNumber')}</label>
                    <div className={inputWrapCls}>
                      <Phone size={15} className="text-zinc-600 shrink-0" />
                      <input type="tel" name="phoneNumber" className={inputCls} value={profileData.phoneNumber} onChange={handleProfileChange} placeholder="+84 9xx xxx xxxx" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>{t('settings.emailAddress')}</label>
                    <div className={`${inputWrapCls} opacity-50`}>
                      <Mail size={15} className="text-zinc-600 shrink-0" />
                      <input type="email" name="email" className={`${inputCls} cursor-not-allowed`} value={profileData.email} disabled />
                    </div>
                  </div>
                </div>
              </div>

                {false && (
                  <>
                    {/* Professional Profile — removed */}
                    <div className={`bg-[#111113] border border-white/10 rounded-2xl shadow-sm ${expandedSections.professional ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300`}>
                      <button
                        type="button"
                        onClick={() => toggleSection('professional')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-white flex items-center gap-2.5">
                          <Briefcase size={16} className="text-[#f5a623]" /> {t('settings.professionalProfile')}
                        </h2>
                        {expandedSections.professional
                          ? <ChevronDown size={16} className="text-zinc-500" />
                          : <ChevronRight size={16} className="text-zinc-600" />}
                      </button>

                      {expandedSections.professional && (
                        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.yearsExperience')}</label>
                              <div className={inputWrapCls}>
                                <Award size={15} className="text-zinc-600 flex-shrink-0" />
                                <input type="number" name="experience" className={inputCls} value={mcProfileData.experience} onChange={handleMCChange} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.baseLocation')}</label>
                              <div className={inputWrapCls}>
                                <MapPin size={15} className="text-zinc-600 flex-shrink-0" />
                                <input type="text" name="regions" className={inputCls} value={mcProfileData.regions} onChange={handleMCChange} placeholder="Ho Chi Minh City, Hanoi" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.hostingStyle')}</label>
                              <div className={inputWrapCls}>
                                <Award size={15} className="text-zinc-600 flex-shrink-0" />
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
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${showBioPreview ? 'bg-[#f5a623] text-black border-[#f5a623]' : 'text-zinc-500 border-white/[0.07] hover:border-white/[0.14]'}`}
                              >
                                {showBioPreview ? 'Edit' : 'Preview'}
                              </button>
                            </div>
                            <div className="bg-[#09090b] border border-white/[0.07] rounded-xl p-3 flex items-start gap-2.5 focus-within:border-white/[0.14] transition-colors">
                              <User size={15} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                              {showBioPreview ? (
                                <div className="w-full min-h-[120px] text-zinc-300 prose prose-invert prose-xs max-w-none overflow-y-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mcProfileData.biography || "*No biography provided yet.*"}</ReactMarkdown>
                                </div>
                              ) : (
                                <textarea name="biography" className="flex-1 bg-transparent text-[13px] text-white placeholder:text-zinc-600 focus:outline-none resize-y min-h-[120px]" value={mcProfileData.biography} onChange={handleMCChange} placeholder="Tell clients about yourself using markdown..." />
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className={labelCls}>{t('settings.personality')}</label>
                              <button
                                type="button"
                                onClick={() => setShowPersonalityPreview(!showPersonalityPreview)}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${showPersonalityPreview ? 'bg-[#f5a623] text-black border-[#f5a623]' : 'text-zinc-500 border-white/[0.07] hover:border-white/[0.14]'}`}
                              >
                                {showPersonalityPreview ? 'Edit' : 'Preview'}
                              </button>
                            </div>
                            <div className="bg-[#09090b] border border-white/[0.07] rounded-xl p-3 flex items-start gap-2.5 focus-within:border-white/[0.14] transition-colors">
                              <Zap size={15} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                              {showPersonalityPreview ? (
                                <div className="w-full min-h-[80px] text-zinc-300 prose prose-invert prose-xs max-w-none overflow-y-auto">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mcProfileData.personality || "*No personality description provided.*"}</ReactMarkdown>
                                </div>
                              ) : (
                                <textarea name="personality" className="flex-1 bg-transparent text-[13px] text-white placeholder:text-zinc-600 focus:outline-none resize-y min-h-[80px]" value={mcProfileData.personality} onChange={handleMCChange} placeholder="Describe your personality using markdown..." />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Attributes */}
                    <div className={`bg-[#111113] border border-white/10 rounded-2xl shadow-sm ${expandedSections.attributes ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300`}>
                      <button
                        type="button"
                        onClick={() => toggleSection('attributes')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-white flex items-center gap-2.5">
                          <Tag size={16} className="text-[#f5a623]" /> {t('settings.skillsAttributes')}
                        </h2>
                        {expandedSections.attributes
                          ? <ChevronDown size={16} className="text-zinc-500" />
                          : <ChevronRight size={16} className="text-zinc-600" />}
                      </button>

                      {expandedSections.attributes && (
                        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
                          <div className="pt-4 space-y-1.5">
                            <label className={labelCls}>{t('settings.languagesComma')}</label>
                            <div className={inputWrapCls}>
                              <Globe size={15} className="text-zinc-600 flex-shrink-0" />
                              <input type="text" name="languages" className={inputCls} value={mcProfileData.languages} onChange={handleMCChange} placeholder="English, Vietnamese" />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.stylesComma')}</label>
                              <div className={inputWrapCls}>
                                <CheckCircle2 size={15} className="text-zinc-600 flex-shrink-0" />
                                <input type="text" name="styles" className={inputCls} value={mcProfileData.styles} onChange={handleMCChange} placeholder="Humorous, Formal" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className={`bg-[#111113] border border-white/10 rounded-2xl shadow-sm ${expandedSections.pricing ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-300`}>
                      <button
                        type="button"
                        onClick={() => toggleSection('pricing')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-white flex items-center gap-2.5">
                          <DollarSign size={16} className="text-[#f5a623]" /> {t('settings.ratesPricing')}
                        </h2>
                        {expandedSections.pricing
                          ? <ChevronDown size={16} className="text-zinc-500" />
                          : <ChevronRight size={16} className="text-zinc-600" />}
                      </button>

                      {expandedSections.pricing && (
                        <div className="px-5 pb-5 space-y-5 border-t border-white/[0.06]">
                          <div className="pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <label className={labelCls}>{t('settings.rangeVnd')}</label>
                              <div className="text-[#f5a623] text-[13px] font-semibold flex gap-2">
                                <span>{(mcProfileData.rates.min || 0).toLocaleString('vi-VN')}đ</span>
                                <span className="text-zinc-600">–</span>
                                <span>{(mcProfileData.rates.max || 0).toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>

                            <div className="relative h-10 flex items-center">
                              <div className="absolute w-full h-1.5 bg-white/[0.07] rounded-full"></div>
                              <div
                                className="absolute h-1.5 bg-[#f5a623] rounded-full"
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
                                  border: 3px solid #09090b;
                                  border-radius: 50%;
                                  cursor: pointer;
                                  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
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
                                  border: 3px solid #09090b;
                                  border-radius: 50%;
                                  cursor: pointer;
                                  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                                }
                              `}} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.minRate')}</label>
                              <div className={inputWrapCls}>
                                <DollarSign size={15} className="text-zinc-600 flex-shrink-0" />
                                <input type="number" name="ratesMin" className={inputCls} value={mcProfileData.rates.min} onChange={handleMCChange} />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={labelCls}>{t('settings.maxRate')}</label>
                              <div className={inputWrapCls}>
                                <DollarSign size={15} className="text-zinc-600 flex-shrink-0" />
                                <input type="number" name="ratesMax" className={inputCls} value={mcProfileData.rates.max} onChange={handleMCChange} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Event Portfolio */}
                    <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => toggleSection('portfolio')}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <h2 className="text-[14px] font-semibold text-white flex items-center gap-2.5">
                          <Camera size={16} className="text-[#f5a623]" /> {t('settings.eventPortfolio')}
                        </h2>
                        {expandedSections.portfolio
                          ? <ChevronDown size={16} className="text-zinc-500" />
                          : <ChevronRight size={16} className="text-zinc-600" />}
                      </button>

                      {expandedSections.portfolio && (
                        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
                          <div className="pt-4">
                            <label className={`${labelCls} block mb-3`}>Portfolio Highlights</label>
                            <label className={`
                              flex flex-col items-center justify-center w-full min-h-[140px]
                              rounded-xl border border-dashed border-white/[0.07] transition-colors cursor-pointer
                              ${portfolioLoading ? 'bg-[#f5a623]/[0.04]' : 'bg-[#09090b] hover:border-white/[0.14] hover:bg-white/[0.02]'}
                            `}>
                              <div className="flex flex-col items-center text-center px-6 py-4">
                                {portfolioLoading ? (
                                  <>
                                    <Loader2 size={32} className="text-[#f5a623] animate-spin mb-3" />
                                    <p className="text-[12px] font-medium text-[#f5a623]">Uploading to Cloudinary...</p>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-12 h-12 rounded-xl bg-[#f5a623]/[0.08] flex items-center justify-center mb-3 text-[#f5a623]">
                                      <Upload size={22} />
                                    </div>
                                    <p className="text-[13px] font-medium text-white mb-1">Upload Event Photos</p>
                                    <p className="text-[11px] text-zinc-500">Drag & drop or click to select (JPG, PNG)</p>
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
                                <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-white/[0.07]">
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
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={15} /> {loading ? t('settings.saving') : t('settings.saveAllChanges')}
                  </button>
                </div>
            </form>
          </div>

          {/* General Section */}
          <div ref={sectionRefs.general} id="section-general" className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={16} className="text-[#f5a623]" />
              <h2 className="text-[15px] font-semibold text-white">{t('settings.general')}</h2>
            </div>
            <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                  <div>
                    <p className="text-[13px] font-medium text-white">{t('settings.interfaceLanguage')}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{t('settings.interfaceLanguageDesc')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="bg-[#09090b] border border-white/[0.07] rounded-xl p-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => i18nInstance.changeLanguage('vi')}
                        className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          i18nInstance.language === 'vi'
                            ? 'bg-[#1a1a1e] text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        VI
                      </button>
                      <button
                        type="button"
                        onClick={() => i18nInstance.changeLanguage('en')}
                        className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                          i18nInstance.language === 'en'
                            ? 'bg-[#1a1a1e] text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        EN
                      </button>
                    </div>
                    {i18nInstance.language === 'en' && (
                      <span className="text-[10px] font-medium text-amber-400/80">⚠ Đang phát triển</span>
                    )}
                  </div>
                </div>
            </div>
          </div>

          {/* Security Section */}
          <div ref={sectionRefs.security} id="section-security" className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} className="text-[#f5a623]" />
              <h2 className="text-[15px] font-semibold text-white">{t('settings.security')}</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
              {/* Password form */}
              <form onSubmit={handlePasswordChange} className="bg-[#111113] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
                <p className="text-[13px] font-medium text-white">{t('settings.changePassword')}</p>
                <div className="space-y-1.5">
                  <label className={labelCls}>{t('settings.currentPassword')}</label>
                  <div className={inputWrapCls}>
                    <Lock size={15} className="text-zinc-600 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      className={inputCls}
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelCls}>Mật khẩu mới</label>
                    <div className={inputWrapCls}>
                      <Shield size={15} className="text-zinc-600 shrink-0" />
                      <input type="password" name="newPassword" className={inputCls} value={securityData.newPassword} onChange={handleSecurityChange} placeholder="Tối thiểu 8 ký tự" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Xác nhận mật khẩu</label>
                    <div className={inputWrapCls}>
                      <Shield size={15} className="text-zinc-600 shrink-0" />
                      <input type="password" name="confirmPassword" className={inputCls} value={securityData.confirmPassword} onChange={handleSecurityChange} placeholder="Nhập lại mật khẩu mới" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1 border-t border-white/[0.06]">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-50">
                    <Save size={14} /> {loading ? "Đang lưu..." : "Cập nhật mật khẩu"}
                  </button>
                </div>
              </form>

              {/* Session + Danger Zone */}
              <div className="bg-[#111113] border border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                {/* Logout */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
                  <div>
                    <p className="text-[13px] font-medium text-white">Đăng xuất</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Kết thúc phiên làm việc hiện tại</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-zinc-300 text-[12px] font-medium hover:bg-white/[0.06] transition-colors"
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
                {/* Delete account */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-red-400">Xóa tài khoản</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Không thể khôi phục sau khi xóa</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/25 text-red-400 text-[12px] font-medium hover:bg-red-500/[0.08] transition-colors">
                    <Trash2 size={14} /> Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div ref={sectionRefs.notifications} id="section-notifications" className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={16} className="text-[#f5a623]" />
              <h2 className="text-[15px] font-semibold text-white">{t('settings.notifications')}</h2>
            </div>
            <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/[0.06] pb-5">
                  <div>
                    <p className="text-[13px] font-medium text-white">{t('settings.notificationDesc')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const allTrue = Object.keys(notifPrefs).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                        setNotifPrefs(allTrue);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#09090b] border border-white/[0.07] text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.14] transition-colors"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={() => {
                        const allFalse = Object.keys(notifPrefs).reduce((acc, key) => ({ ...acc, [key]: false }), {});
                        setNotifPrefs(allFalse);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#09090b] border border-white/[0.07] text-[11px] font-medium text-zinc-400 hover:text-white hover:border-white/[0.14] transition-colors"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[
                    {
                      category: "Email Notifications",
                      description: "Important updates sent to your inbox",
                      icon: Mail,
                      items: [
                        { key: "emailMessages", label: "New Messages", desc: "Receive email alerts for new chat messages." },
                        { key: "emailPayments", label: "Payment Updates", desc: "Get notified about escrow and payout activity." },
                      ],
                    },
                    {
                      category: "Push Notifications",
                      description: "Real-time alerts in your browser/app",
                      icon: Zap,
                      items: [
                        { key: "pushMessages", label: "Chat Messages", desc: "Instant notifications for messages." },
                        { key: "pushMarketing", label: "Platform Updates", desc: "News, tips, and platform announcements." },
                      ],
                    },
                  ].map((section) => (
                    <div key={section.category} className="bg-[#09090b] border border-white/[0.06] rounded-xl p-4 space-y-4">
                      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-3">
                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                          <section.icon size={15} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white">{section.category}</p>
                          <p className="text-[10px] text-zinc-500">{section.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {section.items.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#111113] border border-white/[0.05] hover:border-white/[0.09] transition-colors"
                          >
                            <div className="max-w-[75%]">
                              <p className="text-[13px] font-medium text-white">{item.label}</p>
                              <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNotifPrefs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`w-11 h-6 rounded-full flex items-center transition-colors duration-300 px-0.5 flex-shrink-0 ${notifPrefs[item.key] ? "bg-[#f5a623]" : "bg-white/[0.07]"}`}
                            >
                              <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow ${notifPrefs[item.key] ? "bg-black translate-x-5" : "bg-zinc-400 translate-x-0"}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-5 mt-5 border-t border-white/[0.06]">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] hover:bg-[#e09520] text-black rounded-xl text-[13px] font-semibold transition-colors">
                    <Save size={15} /> {t('settings.saveAllChanges')}
                  </button>
                </div>
            </div>
          </div>

          {/* Payment Section */}
          <div ref={sectionRefs.payment} id="section-payment" className="scroll-mt-20 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[#f5a623]" />
                <h2 className="text-[15px] font-semibold text-white">{t('settings.payment')}</h2>
              </div>
              {user?.isPremium && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-[11px] font-medium text-yellow-400">
                  <Sparkles size={11} fill="currentColor" /> Lifetime Premium
                </span>
              )}
            </div>
            <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 shadow-sm">

                {user?.isPremium ? (
                  <div className="space-y-5">
                    <div className="p-5 rounded-xl bg-[#09090b] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 flex-shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white">Ambassador Lifetime Member</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">Status: <span className="text-emerald-400 font-medium">Active</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Billing Method</p>
                        <p className="text-[13px] font-semibold text-zinc-200">VietQR MBBank</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-medium text-yellow-400 uppercase tracking-wider">All Benefits Unlocked:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Unlimited Vocal analysis recording attempts",
                          "Mel-spectrogram technical coaching insights",
                          "Bilingual feedback breakdown report",
                          "Elite Badge visual verification on profile",
                        ].map((benefit, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-white/[0.05]">
                            <div className="rounded-full bg-emerald-500/10 p-1 text-emerald-400 flex-shrink-0">
                              <Check size={11} />
                            </div>
                            <span className="text-[12px] text-zinc-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {/* Package info */}
                      <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-[#09090b] border border-yellow-500/[0.12]">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-0.5 text-[10px] font-medium text-yellow-400">
                              Special Lifetime Offer
                            </span>
                            <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">-80%</span>
                          </div>
                          <h3 className="text-[18px] font-bold text-white mb-1">Premium Plan</h3>
                          <p className="text-[12px] text-zinc-500 leading-relaxed mb-4">
                            Mở khoá toàn bộ tính năng AI phân tích giọng nói dành cho MC chuyên nghiệp.
                          </p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-white">20,000đ</span>
                            <div>
                              <span className="block text-[13px] text-zinc-500 line-through">100,000đ</span>
                              <span className="text-[10px] font-medium text-emerald-400">Trả một lần · Dùng mãi mãi</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {[
                            { icon: Zap, colorCls: "bg-yellow-500/10 text-yellow-400", label: "Không giới hạn buổi luyện tập", desc: "Ghi âm & phân tích giọng không giới hạn số lần" },
                            { icon: Shield, colorCls: "bg-blue-500/10 text-blue-400", label: "Báo cáo AI Voice chuyên sâu", desc: "Mel-spectrogram, pitch, nhịp điệu & ngữ điệu" },
                            { icon: Languages, colorCls: "bg-purple-500/10 text-purple-400", label: "Phản hồi song ngữ Việt – Anh", desc: "Báo cáo chi tiết đầy đủ bằng 2 ngôn ngữ" },
                            { icon: Award, colorCls: "bg-yellow-500/10 text-yellow-400", label: "Huy hiệu MC Premium", desc: "Huy hiệu xác nhận hiển thị trên hồ sơ cá nhân" },
                          ].map(({ icon: Icon, colorCls, label, desc }, i) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#09090b] border border-white/[0.05] hover:border-white/[0.09] transition-colors">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}>
                                <Icon size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-white">{label}</p>
                                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                              </div>
                              <Check size={12} className="text-emerald-400 flex-shrink-0 mt-1" />
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          {[
                            { icon: Lock, text: "Thanh toán bảo mật" },
                            { icon: Zap, text: "Kích hoạt tức thì" },
                            { icon: CheckCircle2, text: "Truy cập trọn đời" },
                          ].map(({ icon: Icon, text }, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-zinc-600">
                              <Icon size={10} />
                              <span className="text-[11px]">{text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment QR */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#09090b] border border-white/[0.05]">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-3">Hướng dẫn 3 bước</p>
                          <div className="space-y-2.5">
                            {[
                              { n: "1", text: "Mở app ngân hàng → quét mã QR hoặc nhập số tài khoản thủ công" },
                              { n: "2", text: "Nhập đúng số tiền 20,000đ và copy nguyên nội dung Memo bên dưới" },
                              { n: "3", text: "Hệ thống tự động xác nhận và kích hoạt Premium trong vài giây" },
                            ].map(({ n, text }) => (
                              <div key={n} className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">{text}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {paymentLoading ? (
                          <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-[#09090b] border border-white/[0.05]">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                            <p className="mt-3 text-[11px] text-zinc-500">Generating VietQR...</p>
                          </div>
                        ) : paymentError ? (
                          <div className="text-center py-10 rounded-xl bg-[#09090b] border border-white/[0.05] space-y-3">
                            <AlertCircle className="mx-auto text-red-400" size={24} />
                            <p className="text-[12px] text-zinc-400">{paymentError}</p>
                            <button
                              onClick={fetchOrder}
                              className="px-4 py-1.5 bg-[#09090b] border border-white/[0.07] rounded-xl text-[11px] font-medium text-white hover:border-white/[0.14] transition-colors"
                            >
                              Thử lại
                            </button>
                          </div>
                        ) : paymentOrder ? (
                          <div className="rounded-xl bg-[#09090b] border border-white/[0.05] overflow-hidden">
                            <div className="flex items-start gap-4 p-4 border-b border-white/[0.05]">
                              <div className="p-2 rounded-xl bg-white shadow-lg flex-shrink-0">
                                <img src={paymentOrder.qrUrl} alt="VietQR" className="w-32 h-32 object-contain rounded-lg" />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1.5 pt-1">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-2">Thông tin tài khoản</p>
                                {[
                                  { label: "Chủ tài khoản", value: paymentOrder.accountName },
                                  { label: "Ngân hàng", value: "MBBank" },
                                  { label: "Số tài khoản", value: paymentOrder.accountNumber },
                                  { label: "Số tiền", value: "20,000đ" },
                                ].map(({ label, value }) => (
                                  <div key={label} className="flex justify-between items-center gap-2 py-1 border-b border-white/[0.04] last:border-0">
                                    <span className="text-[10px] text-zinc-500 flex-shrink-0">{label}</span>
                                    <span className="text-[11px] font-medium text-zinc-200 text-right truncate">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="p-4 bg-yellow-400/[0.03] border-b border-yellow-400/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-medium text-yellow-400 uppercase tracking-wider">Nội dung chuyển khoản (bắt buộc)</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(paymentOrder.memo);
                                    setCopiedMemo(true);
                                    setTimeout(() => setCopiedMemo(false), 2000);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-medium text-yellow-400/70 hover:text-yellow-400 transition-colors"
                                >
                                  {copiedMemo ? <><Check size={10} /> Đã copy</> : <><Copy size={10} /> Sao chép</>}
                                </button>
                              </div>
                              <code
                                className="block w-full text-center text-[13px] font-bold text-yellow-300 select-all py-2 px-3 rounded-lg bg-yellow-400/[0.05] border border-yellow-400/15 cursor-pointer"
                                onClick={() => {
                                  navigator.clipboard.writeText(paymentOrder.memo);
                                  setCopiedMemo(true);
                                  setTimeout(() => setCopiedMemo(false), 2000);
                                }}
                              >
                                {paymentOrder.memo}
                              </code>
                              <p className="text-[10px] text-yellow-600/80 text-center mt-1.5">Nhấn vào để sao chép · Phải khớp chính xác</p>
                            </div>

                            <div className="flex items-center justify-center gap-2 p-3.5">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                              <span className="text-[10px] font-medium text-zinc-500">Đang chờ xác nhận thanh toán...</span>
                            </div>
                          </div>
                        ) : null}
                      </div>
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
