
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';
import { User, ChatMessage } from '../types';

const Chat: React.FC = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);

    const users = storage.getUsers();
    const r = users.find(u => u.id === receiverId);
    if (!r) {
      navigate('/');
      return;
    }
    setReceiver(r);

    // Initial Load
    fetchMessages(user.id, receiverId!);

    // 1. Real-time Polling Logic (Fallback)
    const interval = setInterval(() => {
      fetchMessages(user.id, receiverId!);
    }, 1000);

    // 2. Storage Event Listener (Instant sync between tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lb_chats') {
        fetchMessages(user.id, receiverId!);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [receiverId, navigate]);

  const fetchMessages = (currentId: string, targetId: string) => {
    const allMessages = storage.getChats();
    const filtered = allMessages.filter(m => 
      (m.senderId === currentId && m.receiverId === targetId) ||
      (m.senderId === targetId && m.receiverId === currentId)
    );
    
    // Only update if messages actually changed
    setMessages(prev => {
      if (prev.length !== filtered.length) return filtered;
      // Also check last message content to be sure
      if (prev.length > 0 && filtered.length > 0 && prev[prev.length-1].id !== filtered[filtered.length-1].id) {
        return filtered;
      }
      return prev;
    });
  };

  useEffect(() => {
    // Smooth scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !receiverId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: currentUser.id,
      receiverId: receiverId,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    const allChats = storage.getChats();
    storage.setChats([...allChats, newMessage]);
    
    // Local update for immediate feedback
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate neighbor response for first-time interactions
    const myMsgCount = messages.filter(m => m.senderId === currentUser.id).length;
    if (myMsgCount === 0) {
      setIsTyping(true);
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: `Hi neighbor! This is ${receiver?.name}. Thanks for reaching out. I'll get back to you regarding your query as soon as possible!`,
          timestamp: new Date().toISOString()
        };
        const updatedChats = [...storage.getChats(), reply];
        storage.setChats(updatedChats);
        setMessages(prev => [...prev, reply]);
        setIsTyping(false);
      }, 2000);
    }
  };

  if (!currentUser || !receiver) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white rounded-t-[2.5rem] border-x border-t border-slate-200 p-6 flex items-center gap-4 shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
          {receiver.name.charAt(0)}
        </div>
        <div className="flex-grow">
          <h2 className="font-black text-slate-800 text-lg leading-none mb-1">{receiver.name}</h2>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {isTyping ? 'Typing...' : 'Online Now'}
          </p>
        </div>
        <button 
           onClick={() => alert('Real-time audio calls are coming soon!')}
           className="w-12 h-12 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all text-lg shadow-sm"
        >
          <i className="fas fa-phone"></i>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-grow bg-slate-50/50 border-x border-slate-200 overflow-y-auto p-8 space-y-6 no-scrollbar relative">
        <div className="flex justify-center mb-8">
           <span className="px-4 py-1.5 bg-white/80 backdrop-blur rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100 shadow-sm">
             Today
           </span>
        </div>

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[80%] px-6 py-4 rounded-[2rem] shadow-sm text-sm font-medium ${
              m.senderId === currentUser.id 
                ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-100' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              {m.text}
              <div className={`text-[8px] mt-2 font-black uppercase tracking-widest opacity-60 flex items-center justify-end gap-1`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {m.senderId === currentUser.id && <i className="fas fa-check-double text-[7px]"></i>}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white px-6 py-4 rounded-[2rem] rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
               <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-b-[2.5rem] border border-slate-200 p-6 flex gap-4 shadow-2xl shadow-slate-200/50 z-10">
        <div className="flex-grow relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a message to your neighbor..."
            className="w-full px-8 py-5 rounded-[1.8rem] bg-slate-50 border-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold placeholder:text-slate-300 transition-all"
          />
          <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600">
             <i className="fas fa-paperclip text-lg"></i>
          </button>
        </div>
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-16 h-16 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-90 group"
        >
          <i className="fas fa-paper-plane text-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
        </button>
      </form>
    </div>
  );
};

export default Chat;
