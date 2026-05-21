import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Calendar as CalendarIcon,
  Clock3,
  FileText,
  MapPin,
  MessageCircle,
  Play,
  Shield,
  Star,
  CheckCircle2,
  ArrowRight,
  Award,
  Quote,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const currencyFormatter = new Intl.NumberFormat("vi-VN");

const MCProfileView = ({ mc, calendarEvents = [], reviewsList = [], authUser, bookTargetId, isPreview = false }) => {
  const eventStyleGetter = (event) => {
    const palette = {
      Accepted: ["rgba(34,197,94,0.18)", "#4ade80"],
      Booked: ["rgba(34,197,94,0.18)", "#4ade80"],
      Pending: ["rgba(253,184,19,0.14)", "#facc15"],
      Busy: ["rgba(239,68,68,0.16)", "#f87171"],
      Available: ["rgba(56,189,248,0.14)", "#38bdf8"],
    };
    const [backgroundColor, color] = palette[event.status] || [
      "rgba(255,255,255,0.08)",
      "#e2e8f0",
    ];

    return {
      style: {
        backgroundColor,
        color,
        border: `1px solid ${color}33`,
        borderRadius: "10px",
        fontSize: "12px",
        fontWeight: 700,
        padding: "4px 8px",
      },
    };
  };

  if (!mc) return null;

  return (
    <div className={`space-y-8 ${isPreview ? '' : 'pb-20'}`}>
      {!isPreview && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .rbc-calendar { color: #f8fafc; font-family: inherit; }
              .rbc-toolbar { margin-bottom: 1rem; gap: 0.75rem; }
              .rbc-toolbar button { color: #f8fafc; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
              .rbc-toolbar button.rbc-active, .rbc-toolbar button:hover { background: #FDB813; color: #091224; border-color: #FDB813; }
              .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; overflow: hidden; background: rgba(15,23,42,0.45); }
              .rbc-header, .rbc-time-header-content, .rbc-time-content, .rbc-month-row { border-color: rgba(255,255,255,0.06) !important; }
              .rbc-header { padding: 10px 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; }
              .rbc-date-cell { padding: 6px; font-weight: 700; }
              .rbc-today { background: rgba(253,184,19,0.06); }
              .rbc-off-range-bg { background: rgba(2,6,23,0.45); }
            `,
          }}
        />
      )}

      <section className={`glass-card relative overflow-hidden rounded-4xl border border-gold/15 shadow-2xl ${isPreview ? 'p-6' : 'p-8 md:p-10'}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,184,19,0.18),transparent_30%),linear-gradient(135deg,rgba(0,35,102,0.95),rgba(15,23,42,0.92))]" />
        <div className={`relative grid gap-8 ${isPreview ? 'grid-cols-1' : 'lg:grid-cols-[1.3fr_0.8fr]'}`}>
          <div className="space-y-6">
            <div className={`flex flex-col gap-6 ${isPreview ? '' : 'md:flex-row md:items-end'}`}>
              <div className={`relative overflow-hidden rounded-[28px] border border-white/10 shadow-2xl ${isPreview ? 'h-32 w-32' : 'h-40 w-40'}`}>
                <img src={mc.avatar} alt={mc.name} className="h-full w-full object-cover" />
                {mc.verified && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300 backdrop-blur">
                    <Shield size={12} /> Verified
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className={`font-black tracking-tight text-white ${isPreview ? 'text-3xl' : 'text-4xl md:text-5xl'}`}>
                    {mc.name}
                  </h1>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-200">
                    THE MC HUB Talent
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                    <Star size={16} className="text-gold" fill="currentColor" />
                    {mc.rating ? mc.rating.toFixed(1) : "New"} rating
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                    <Quote size={16} className="text-gold" />
                    {reviewsList.length} reviews
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                    <MapPin size={16} className="text-gold" />
                    {mc.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mc.specialties && [...mc.specialties, ...(mc.styles || [])].slice(0, 8).map((item) => (
                    <span key={item} className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={`grid gap-4 ${isPreview ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Personality</p>
                <div className="mt-2 text-sm leading-6 text-slate-100 prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mc.personality}</ReactMarkdown>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Hosting Style</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">{mc.hostingStyle}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Experience</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  {mc.experience ? `${mc.experience}+ years on stage` : "Experienced across premium live events"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/10 bg-slate-950/35 p-6 backdrop-blur-xl h-fit">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">Book This MC</p>
            <div>
              <p className="text-sm text-slate-400">Starting price</p>
              <p className="mt-2 text-4xl font-black text-white">
                {mc.rates?.min ? `${currencyFormatter.format(mc.rates.min)} VND` : "Custom quote"}
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-5 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-400">
                  <Clock3 size={16} className="text-gold" /> Languages
                </span>
                <span className="font-bold">{mc.languages?.length ? mc.languages.join(", ") : "VN / EN"}</span>
              </div>
            </div>
            
            {!isPreview && (
              <>
                {(authUser?.role || "").toLowerCase() === "client" && (
                  <Link to={`/m/booking/${bookTargetId}`} className="btn btn-primary lg w-full rounded-2xl">
                    Book This MC <ArrowRight size={18} />
                  </Link>
                )}
                <Link to={`/m/messaging?mcId=${bookTargetId}`} className="btn btn-outline w-full rounded-2xl py-3.5">
                  <MessageCircle size={18} /> Send Message
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className={`grid gap-8 ${isPreview ? 'grid-cols-1' : 'lg:grid-cols-[1.35fr_0.95fr]'}`}>
        <div className="space-y-8">
          {/* Event Portfolio Carousel */}
          {mc.eventPhotos && mc.eventPhotos.length > 0 && (
            <section className="glass-card rounded-[28px] border border-white/5 p-8 relative overflow-hidden group/portfolio">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32" />
              
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera size={22} className="text-gold" />
                  <h2 className="text-2xl font-black text-white">Event Portfolio</h2>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const container = document.getElementById('portfolio-container');
                      container.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-gold/20 hover:border-gold/30 text-white transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      const container = document.getElementById('portfolio-container');
                      container.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-gold/20 hover:border-gold/30 text-white transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div 
                id="portfolio-container"
                className="flex gap-4 overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {mc.eventPhotos.map((photo, index) => (
                  <div 
                    key={index} 
                    className="relative flex-shrink-0 w-72 md:w-80 aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 snap-start group/photo"
                  >
                    <img 
                      src={photo} 
                      alt={`Event ${index}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                       <p className="text-xs font-black text-gold uppercase tracking-[0.2em]">Portfolio Highlight</p>
                       <p className="text-white text-sm font-bold mt-1">Premium Event Excellence</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                 {mc.eventPhotos.map((_, i) => (
                   <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
                 ))}
              </div>
            </section>
          )}

          <section className="glass-card rounded-[28px] border border-white/5 p-8">
            <div className="mb-5 flex items-center gap-3">
              <FileText size={22} className="text-gold" />
              <h2 className="text-2xl font-black">MC Introduction</h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-slate-300 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{mc.biography}</ReactMarkdown>
            </div>
          </section>

          {!isPreview && (
            <section className="glass-card rounded-[28px] border border-white/5 p-8">
              <div className="mb-6 flex items-center gap-3">
                <CalendarIcon size={22} className="text-gold" />
                <h2 className="text-2xl font-black">Availability Calendar</h2>
              </div>
              <div className="h-140">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  defaultView="month"
                  views={["month", "week", "agenda"]}
                  eventPropGetter={eventStyleGetter}
                />
              </div>
            </section>
          )}
        </div>
        
        {!isPreview && (
          <div className="space-y-8">
            <section className="glass-card rounded-[28px] border border-gold/10 p-8">
              <div className="mb-6 flex items-center gap-3">
                <Award size={22} className="text-gold" />
                <h2 className="text-2xl font-black">Pricing</h2>
              </div>
              <div className="space-y-4">
                {mc.packages && mc.packages.map((pkg) => (
                  <div key={`${pkg.name}-${pkg.price}`} className="rounded-3xl border border-white/8 bg-slate-950/40 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Starting at</p>
                        <p className="mt-2 text-lg font-black text-gold">
                          {pkg.price ? `${currencyFormatter.format(pkg.price)} VND` : "Custom"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
      {!isPreview && (
        <section className="glass-card rounded-[28px] border border-white/5 p-8 mt-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Quote size={22} className="text-gold" />
              <h2 className="text-2xl font-black text-white">Client Reviews</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                <Star size={16} className="text-gold" fill="currentColor" />
                <span className="text-sm font-black text-white">{mc.rating ? mc.rating.toFixed(1) : "New"}</span>
                <span className="text-xs text-slate-500 font-bold ml-1">Overall Rating</span>
              </div>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {reviewsList.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-sm">
                <MessageCircle size={48} className="mx-auto mb-4 text-slate-700" />
                <p className="text-slate-500 font-bold text-lg">No reviews yet for this MC.</p>
                <p className="text-slate-600 text-sm mt-1">Be the first to share your experience!</p>
              </div>
            ) : (
              reviewsList.map((review) => (
                <div 
                  key={review._id || review.id} 
                  className="group relative rounded-[2.5rem] border border-white/10 bg-slate-950/40 p-8 transition-all duration-500 hover:border-gold/40 hover:bg-slate-900/60 hover:shadow-[0_20px_50px_-20px_rgba(212,175,55,0.15)] flex flex-col"
                >
                  {/* Background Accents */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-[60px] rounded-full group-hover:bg-gold/10 transition-colors" />
                  
                  <div className="relative flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 rounded-2xl border border-white/10 bg-gradient-to-br from-gold/20 to-transparent p-0.5 overflow-hidden">
                        <img 
                          src={review.client?.avatar || `https://ui-avatars.com/api/?name=${review.client?.name || 'User'}&background=FDB813&color=091224&bold=true`} 
                          alt={review.client?.name} 
                          className="h-full w-full object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg tracking-tight group-hover:text-gold transition-colors">{review.client?.name || "Premium Client"}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.15em]">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"}
                          </p>
                          {review.eventTypeName && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-700" />
                              <span className="text-[10px] font-black text-gold/80 uppercase tracking-[0.15em]">
                                {review.eventTypeName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-0.5 bg-slate-950/50 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          fill={star <= review.rating ? "currentColor" : "none"} 
                          className={star <= review.rating ? "text-gold" : "text-slate-800"} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative flex-1 group/text">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 shrink-0">
                        <Quote size={18} className="text-gold fill-gold/10" />
                      </div>
                      <p className="text-base leading-8 text-slate-300 font-medium italic group-hover/text:text-slate-100 transition-colors">
                        {review.comment || "An exceptional performance that exceeded all expectations. Highly recommended for any premium event."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified Stay</span>
                    </div>
                    <div className="flex -space-x-2">
                       <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500">TH</div>
                       <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-400">MC</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MCProfileView;
