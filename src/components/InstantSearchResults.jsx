import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Search, ArrowRight } from "lucide-react";

const InstantSearchResults = ({ results, loading, query, onResultClick }) => {
  if (!query) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#111113] border border-white/[0.08] rounded-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50">
      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-2 border-[#f5a623] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Searching</p>
        </div>
      ) : results.length > 0 ? (
        <div className="flex flex-col">
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Search size={11} className="text-[#f5a623]" /> MC Matches
            </p>
            <span className="text-[11px] text-zinc-500 bg-[#09090b] px-2 py-0.5 rounded-md border border-white/[0.06]">{results.length} found</span>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {results.map((mc) => (
              <Link
                key={mc.id}
                to={`/m/profile/${mc.id}`}
                onClick={onResultClick}
                className="group flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0"
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-md bg-[#09090b] border border-white/[0.07] flex items-center justify-center text-zinc-400 font-medium text-[13px]">
                    {mc.avatar ? (
                      <img src={mc.avatar} alt="" className="w-full h-full rounded-md object-cover" />
                    ) : (
                      (mc.displayName || mc.name || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  {mc.status === "AVAILABLE" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#111113]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-medium text-white group-hover:text-[#f5a623] transition-colors truncate">
                    {mc.displayName || mc.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1 text-[11px] text-[#f5a623]">
                      <Star size={10} fill="currentColor" />
                      {mc.rating?.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <MapPin size={10} />
                      <span className="truncate">{mc.regions?.[0] || "Universal"}</span>
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-md border border-white/[0.06] flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-white/[0.12] transition-colors shrink-0">
                  <ArrowRight size={13} />
                </div>
              </Link>
            ))}
          </div>

          <Link
            to={`/m/search?q=${query}`}
            onClick={onResultClick}
            className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[12px] text-zinc-500 hover:text-white transition-colors"
          >
            See all results <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="p-10 text-center flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-[#09090b] border border-white/[0.07] rounded-md flex items-center justify-center mb-1">
            <Search size={18} className="text-zinc-500" />
          </div>
          <p className="text-[13px] text-zinc-400">No results for "<span className="text-[#f5a623]">{query}</span>"</p>
          <p className="text-[11px] text-zinc-500">Check spelling or try different keywords</p>
        </div>
      )}
    </div>
  );
};

export default InstantSearchResults;
