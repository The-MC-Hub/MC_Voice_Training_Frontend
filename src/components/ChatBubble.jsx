import { MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ChatBubble = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;
  if (location.pathname.startsWith('/m/messaging')) return null;

  return (
    <Link
      to="/m/messaging"
      title="Tin nhắn"
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all duration-200"
    >
      <MessageCircle size={20} />
    </Link>
  );
};

export default ChatBubble;
