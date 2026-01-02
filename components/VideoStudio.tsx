
import React, { useState, useRef } from 'react';
import { Play, Upload, Download, Film, Loader2, Monitor, Smartphone, Video as VideoIcon } from 'lucide-react';
import { generateVideo, downloadMedia } from '../services/geminiService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [sourceImage, setSourceImage] = useState<{data: string, type: string} | null>(null);
  const [progressMsg, setProgressMsg] = useState('جاري بدء المحرك...');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = [
    'جاري تحليل السيناريو...',
    'رسم المشاهد الأولية...',
    'توليد الحركة السينمائية...',
    'تحسين الإضاءة والظلال...',
    'وضع اللمسات النهائية...',
    'أوشكنا على الانتهاء...'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage({
          data: (event.target?.result as string).split(',')[1],
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    // MANDATORY: Check if an API key has been selected before using Veo models.
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
      // Assume selection successful to mitigate race conditions as per instructions.
    }

    setIsLoading(true);
    let msgIdx = 0;
    const interval = setInterval(() => {
      setProgressMsg(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 12000);

    try {
      const videoUrl = await generateVideo(
        prompt, 
        { aspectRatio, resolution }, 
        sourceImage?.data, 
        sourceImage?.type
      );
      setResultVideo(videoUrl);
    } catch (error: any) {
      console.error(error);
      // If the error indicates missing/invalid entity (API key issue for Veo), prompt for key again.
      if (error.message === "API_KEY_REQUIRED") {
        alert('يرجى اختيار مفتاح API مفعل عليه الدفع من مشروع GCP لاستخدام توليد الفيديو.');
        await (window as any).aistudio.openSelectKey();
      } else {
        alert('حدث خطأ أثناء توليد الفيديو. تأكد من صحة مفتاح API');
      }
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Settings Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Film className="text-purple-400" size={20} />
            <h3 className="font-bold text-lg">تحويل النص إلى فيديو (Veo)</h3>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-400">وصف المشهد السينمائي</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: لقطة سينمائية لغابة سحرية تتوهج فيها الأشجار باللون الأزرق..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-400">تحريك صورة موجودة (اختياري)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                sourceImage ? 'border-purple-500 bg-purple-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload}
                accept="image/*"
              />
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Upload size={20} className={sourceImage ? 'text-purple-400' : 'text-slate-500'} />
              </div>
              <div className="text-right overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {sourceImage ? 'تم اختيار الصورة' : 'ارفع صورة للتحريك'}
                </p>
                <p className="text-xs text-slate-500">ستستخدم كإطار أول للفيديو</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-500 px-1">الأبعاد</label>
              <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  <Monitor size={14} />
                  عرضي
                </button>
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg gap-2 transition-all ${aspectRatio === '9:16' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'}`}
                >
                  <Smartphone size={14} />
                  طولي
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-500 px-1">الدقة</label>
              <select 
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="720p">720p HD</option>
                <option value="1080p">1080p Full HD</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-purple-500/10"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                توليد الفيديو
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Preview */}
      <div className="lg:col-span-8">
        <div className="glass rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 to-transparent">
          {resultVideo ? (
            <div className="w-full h-full flex flex-col items-center p-6 gap-6">
              <div className={`relative group w-full ${aspectRatio === '16:9' ? 'max-w-3xl' : 'max-w-sm'} rounded-2xl overflow-hidden shadow-2xl border border-white/5`}>
                <video 
                  src={resultVideo} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => downloadMedia(resultVideo, 'gemini-video.mp4')}
                  className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold shadow-xl shadow-purple-500/20 transition-all"
                >
                  <Download size={20} />
                  تحميل الفيديو إلى جهازك
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <VideoIcon className="text-slate-700" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-300">أبهر العالم بفيديوهاتك</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                نموذج Veo 3.1 يمنحك جودة سينمائية مذهلة. استغرق عملية التوليد ما بين 1 إلى 3 دقائق، يرجى الصبر.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 z-20 glass flex flex-col items-center justify-center gap-6 p-8 text-center">
              <div className="relative">
                <Loader2 className="animate-spin text-purple-500" size={64} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film size={24} className="text-purple-300" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-purple-400">{progressMsg}</p>
                <p className="text-sm text-slate-400">نقوم ببناء عالمك من الصفر بذكاء اصطناعي فائق</p>
              </div>
              <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 animate-[loading_120s_ease-in-out_infinite]" style={{ width: '0%' }}></div>
              </div>
              <style>{`
                @keyframes loading {
                  0% { width: 0%; }
                  100% { width: 95%; }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
