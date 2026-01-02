
import React, { useState } from 'react';
import { Palette, Sparkles, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-['Cairo']">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Palette className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text tracking-tight leading-tight">صابر AI</h1>
              <p className="text-[10px] text-slate-500 font-medium">ستوديو الوسائط الذكي</p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${activeTab === 'image' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <ImageIcon size={16} />
              <span className="font-bold text-sm">صور</span>
            </button>
            <button 
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all ${activeTab === 'video' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <VideoIcon size={16} />
              <span className="font-bold text-sm">فيديو</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
          <Sparkles size={16} className="text-blue-400" />
          <span className="text-sm font-bold text-blue-400">الإصدار المتطور</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {activeTab === 'image' ? <ImageStudio /> : <VideoStudio />}
      </main>

      {/* Footer */}
      <footer className="p-8 text-center border-t border-white/5 bg-slate-950/50">
        <div className="max-w-md mx-auto space-y-2">
          <p className="font-bold text-slate-400 text-lg">صابر AI</p>
          <p className="text-slate-500 text-sm">تكنولوجيا مدعومة بأحدث نماذج Gemini لتوليد وتحسين الصور والفيديوهات بدقة سينمائية.</p>
          <p className="pt-4 text-xs text-slate-600">
            &copy; {new Date().getFullYear()} جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
