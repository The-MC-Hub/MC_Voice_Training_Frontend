import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Share2, BookOpen, ChevronRight, CheckCircle2, Mic } from 'lucide-react';
import { academyService } from '../services/academyService';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/ui/Breadcrumb';
import PageLoader from '../components/ui/PageLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../markdown.css';

const ReadingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mId = queryParams.get('mId');
  const courseId = queryParams.get('courseId');

  const [guide, setGuide] = useState(null);
  const [course, setCourse] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const guideRes = await academyService.getReadingGuide(id);
        console.log(guideRes.data.data || guideRes.data)
        setGuide(guideRes.data.data || guideRes.data);
        if (mId) {
          const [mRes, cRes] = await Promise.all([
            academyService.getMilestone(mId),
            academyService.getMilestoneContents(mId)
          ]);
          setMilestone(mRes.data.data || mRes.data);
          setCurriculum(cRes.data.data || cRes.data);
        } else if (courseId) {
          const cRes = await academyService.getCourseDetail(courseId);
          setCourse(cRes.data?.data || cRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch reading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, mId]);

  const handleSwitchLesson = (lesson) => {
    if (lesson.type === 'VOICE_PRACTICE') navigate(`/m/voice/practice/${lesson.voiceScriptId}?mId=${mId}`);
    else if (lesson.type === 'READING_GUIDE') navigate(`/m/learning/guide/${lesson.readingGuideId}?mId=${mId}`);
  };

  if (loading) return <PageLoader />;
  if (!guide) return <div className="text-white text-center py-40">Guide not found.</div>;

  return (
    <div className="bg-[#09090b] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex pt-24 min-h-screen overflow-hidden">

        {/* Sidebar */}
        {mId && (
          <aside className="w-72 border-r border-white/[0.06] bg-[#09090b] flex flex-col sticky top-24 h-[calc(100vh-6rem)] shrink-0 overflow-hidden hidden lg:flex">
            <div className="p-5 border-b border-white/[0.06]">
              <button
                onClick={() => navigate(`/m/learning/milestone/${mId}`)}
                className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[12px] mb-4 group"
              >
                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Roadmap
              </button>
              <h2 className="text-[14px] font-semibold text-white leading-snug line-clamp-2">{milestone?.title}</h2>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Progress</span>
                <span className="text-[10px] font-medium text-[#f5a623]">{milestone?.progress || 0}%</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {curriculum.map((item) => {
                const isActive = item.readingGuideId === id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSwitchLesson(item)}
                    className={`w-full text-left p-3 rounded-xl transition-colors border flex items-center gap-3 ${isActive
                      ? 'bg-[#f5a623]/[0.08] border-[#f5a623]/20 text-[#f5a623]'
                      : 'border-transparent text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300'
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-[#f5a623] text-black' : 'bg-[#111113] text-zinc-500'
                      }`}>
                      {item.type === 'VOICE_PRACTICE' ? <Mic size={12} /> : <BookOpen size={12} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[12px] font-medium line-clamp-2 leading-snug">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 opacity-60">
                        {item.status === 'completed' && <CheckCircle2 size={9} className="text-emerald-500" />}
                        <span className="text-[10px] uppercase tracking-tight">{item.duration}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-6rem)]">

          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-14">
            {courseId && !mId && (
              <div className="mb-8">
                <Breadcrumb items={[
                  { label: 'Khóa học', href: '/m/courses' }, 
                  { label: course?.title || 'Chi tiết khóa học', href: `/m/courses/${courseId}` }, 
                  { label: guide.title }
                ]} />
              </div>
            )}
            {/* Header */}
            <div className="mt-4 space-y-6 mb-12">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[#f5a623] text-[11px] font-medium">
                  {guide.category || 'Academy Guide'}
                </span>
                <span className="text-zinc-600 text-[11px] flex items-center gap-1">
                  <Clock size={11} /> 15 min read
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-white">
                {guide.title}
              </h1>
              <div className="flex items-center justify-between py-5 border-y border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f5a623] flex items-center justify-center text-black font-bold">
                    {guide.author?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{guide.author || 'MCHub Elite'}</p>
                    <p className="text-[11px] text-zinc-500">Industry Mentor</p>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-xl bg-[#111113] border border-white/[0.07] flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                  <Share2 size={15} />
                </button>
              </div>
            </div>

            {/* Content */}
            <article className="premium-markdown mb-16">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {guide.content}
              </ReactMarkdown>
            </article>

            {/* Footer CTA */}
            <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">Mark as Completed</h3>
                  <p className="text-zinc-500 text-[12px]">You've finished this guide. Ready for the next challenge?</p>
                </div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#f5a623] text-black rounded-xl text-[13px] font-semibold hover:bg-[#e09520] transition-colors shrink-0"
              >
                Complete Unit <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadingView;
