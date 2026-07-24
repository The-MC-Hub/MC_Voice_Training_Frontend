import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import * as favoriteService from '../services/favoriteService';
import { Heart, MapPin, Globe, Star, Mic, Award, Calendar, ChevronRight, Quote } from 'lucide-react';

export default function MCProfilePublic() {
  const { id } = useParams();
  const [mc, setMc] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/public/mcs/${id}`).then((r) => setMc(r.data.data)),
      api.get(`/reviews/mc/${id}`).then((r) => setReviews(Array.isArray(r.data.data) ? r.data.data : r.data.data?.reviews || []))
        .catch(() => setReviews([])),
      favoriteService.checkFavorite(id).then((r) => setIsFav(r?.isFavorited || false))
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleToggleFav = async () => {
    try {
      const r = await favoriteService.toggleFavorite(id);
      setIsFav(r?.favorited !== undefined ? r.favorited : !isFav);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!mc) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Mic size={48} className="text-zinc-200 dark:text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 font-medium">Không tìm thấy MC</p>
      </div>
    </div>
  );

  const ratesMin = mc.ratesMin || mc.rates?.min || 0;
  const ratesMax = mc.ratesMax || mc.rates?.max || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-7 mb-6 relative overflow-hidden"
        >
          {/* Decorative gradient blob */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-start gap-5 mb-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-zinc-100 dark:ring-zinc-800 shadow-md">
                  <img
                    src={mc.avatar || 'https://ui-avatars.com/api/?name=MC&background=amber&color=fff'}
                    alt={mc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {mc.verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-zinc-900">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{mc.name}</h1>
                    {mc.bio && (
                      <p className="text-sm text-zinc-500 mt-1">{mc.bio}</p>
                    )}
                  </div>
                  <button
                    onClick={handleToggleFav}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
                      isFav
                        ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Heart size={16} className={isFav ? 'fill-rose-500 text-rose-500' : ''} />
                    {isFav ? 'Đã yêu thích' : 'Yêu thích'}
                  </button>
                </div>

                {mc.rating > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= Math.round(mc.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 dark:text-zinc-700'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {mc.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-400">
                      ({mc.reviewsCount || 0} đánh giá)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enriched info grid — 4 columns with new stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {ratesMin > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Giá</p>
                  <p className="text-sm font-bold text-amber-600">
                    {ratesMin.toLocaleString()}đ
                    {ratesMax > ratesMin && ` - ${ratesMax.toLocaleString()}đ`}
                  </p>
                </div>
              )}
              {mc.experience > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Kinh nghiệm</p>
                  <p className="text-sm font-bold">{mc.experience} năm</p>
                </div>
              )}
              {mc.totalEvents > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Sự kiện đã dẫn</p>
                  <p className="text-sm font-bold text-amber-600">{mc.totalEvents} SK</p>
                </div>
              )}
              {mc.responseTime > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Phản hồi</p>
                  <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                    ⚡ {mc.responseTime} phút
                  </p>
                </div>
              )}
              {mc.regions?.length > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Khu vực</p>
                  <p className="text-sm font-bold truncate flex items-center gap-1">
                    <MapPin size={12} className="text-amber-500" />
                    {mc.regions.join(', ')}
                  </p>
                </div>
              )}
              {mc.languages?.length > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Ngôn ngữ</p>
                  <p className="text-sm font-bold truncate">{mc.languages.join(', ')}</p>
                </div>
              )}
              {mc.achievements?.length > 0 && (
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Thành tích</p>
                  <p className="text-sm font-bold truncate text-purple-500">{mc.achievements.length} thành tích</p>
                </div>
              )}
            </div>

            {/* Event types */}
            {mc.eventTypes?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Loại sự kiện</p>
                <div className="flex flex-wrap gap-2">
                  {mc.eventTypes.map((et) => (
                    <span
                      key={et}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                    >
                      {et}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio / Biography */}
            {(mc.biography || mc.personality || mc.hostingStyle) && (
              <div className="space-y-4 mb-6">
                {mc.biography && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Giới thiệu</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{mc.biography}</p>
                  </div>
                )}
                {mc.personality && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phong cách</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{mc.personality}</p>
                  </div>
                )}
                {mc.hostingStyle && (
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Dẫn dắt</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{mc.hostingStyle}</p>
                  </div>
                )}
              </div>
            )}

            {/* Notable events */}
            {mc.notableEvents?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award size={12} /> Sự kiện nổi bật
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mc.notableEvents.map((ev, i) => (
                    <span key={i} className="text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-lg">
                      {ev}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {mc.achievements?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  🏅 Thành tích
                </h3>
                <div className="flex flex-wrap gap-2">
                  {mc.achievements.map((a, i) => (
                    <span key={i} className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/30">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio — showreels & media */}
            {mc.portfolio && Object.keys(mc.portfolio).length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  📹 Portfolio / Showreel
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(mc.portfolio).map(([name, url], i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-amber-300 hover:text-amber-600 transition-all flex items-center gap-1.5">
                      ▶ {name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {mc.socialLinks && (mc.socialLinks.youtube || mc.socialLinks.tiktok || mc.socialLinks.facebook || mc.socialLinks.zalo) && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Mạng xã hội</h3>
                <div className="flex items-center gap-3">
                  {mc.socialLinks.youtube && (
                    <a href={mc.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-red-500 hover:underline flex items-center gap-1">▶ YouTube</a>
                  )}
                  {mc.socialLinks.tiktok && (
                    <a href={mc.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-zinc-500 hover:underline flex items-center gap-1">🎵 TikTok</a>
                  )}
                  {mc.socialLinks.facebook && (
                    <a href={mc.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-500 hover:underline flex items-center gap-1">f Facebook</a>
                  )}
                  {mc.socialLinks.zalo && (
                    <a href={mc.socialLinks.zalo} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">💬 Zalo</a>
                  )}
                </div>
              </div>
            )}

            <Link
              to={`/m/booking?mcId=${mc.id || mc._id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all active:scale-[0.97] shadow-sm"
            >
              Đặt lịch ngay <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-7"
        >
          <h2 className="text-lg font-bold mb-1">Đánh giá</h2>
          <p className="text-xs text-zinc-400 mb-6">
            {reviews.length} đánh giá từ khách hàng
          </p>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <Quote size={24} className="text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">Chưa có đánh giá nào</p>
              <p className="text-xs text-zinc-400 mt-1">Hãy là người đầu tiên đánh giá MC này</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-zinc-50 dark:border-zinc-800 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      <img
                        src={r.clientAvatar || 'https://ui-avatars.com/api/?name=U&background=amber&color=fff'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-sm">
                          {r.clientName || 'Ẩn danh'}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 dark:text-zinc-700'}
                          />
                        ))}
                      </div>
                      {r.comment && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
