
import React, { useState, useRef } from 'react';
import { Send, Upload, Download, Wand2, Loader2, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';
import { generateImage, enhanceImage, downloadMedia } from '../services/geminiService';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<{data: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setIsLoading(true);
    try {
      const generatedUrl = await generateImage(
        prompt, 
        sourceImage?.data, 
        sourceImage?.type
      );
      setResultImage(generatedUrl);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء توليد الصورة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!sourceImage && !resultImage) {
      alert('يرجى رفع صورة أولاً لتحسينها');
      return;
    }
    
    setIsEnhancing(true);
    try {
      // Use result image if available, otherwise use source image
      const imageToEnhance = resultImage ? resultImage.split(',')[1] : sourceImage?.data;
      const mimeType = sourceImage?.type || 'image/png';
      
      if (!imageToEnhance) return;

      const enhancedUrl = await enhanceImage(imageToEnhance, mimeType);
      setResultImage(enhancedUrl);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تحسين الصورة');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="glass p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-blue-400" size={20} />
            <h3 className="font-bold text-lg">تحويل النص إلى صورة</h3>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm text-slate-400">وصف الصورة</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: رائد فضاء يركب خيلاً في الفضاء..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-4 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-slate-400">الصورة الحالية (للتعديل أو التحسين)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                sourceImage ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload}
                accept="image/*"
              />
              {sourceImage ? (
                <div className="flex flex-col items-center">
                   <img 
                    src={`data:${sourceImage.type};base64,${sourceImage.data}`} 
                    className="w-16 h-16 object-cover rounded-lg mb-2 border border-blue-500/30" 
                    alt="Source Preview" 
                   />
                  <p className="text-xs text-blue-400 font-medium">تم رفع الصورة</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSourceImage(null); }}
                    className="mt-1 text-[10px] text-red-400 hover:underline"
                  >
                    إزالة
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="text-slate-500 mb-2" size={24} />
                  <p className="text-sm text-slate-500">ارفع صورة لتحسينها</p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading || isEnhancing || !prompt}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Wand2 size={20} />
                  توليد جديد
                </>
              )}
            </button>

            <button
              onClick={handleEnhance}
              disabled={isLoading || isEnhancing || (!sourceImage && !resultImage)}
              className="w-full py-4 bg-slate-800 border border-blue-500/30 text-blue-400 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {isEnhancing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Zap size={20} className="fill-current" />
                  تحسين الصورة وإزالة البكسلات
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="lg:col-span-8">
        <div className="glass rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent">
          {resultImage ? (
            <div className="w-full h-full flex flex-col items-center p-6 gap-6">
              <div className="relative group w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img src={resultImage} alt="Result" className="w-full object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={() => downloadMedia(resultImage, 'saber-ai-image.png')}
                    className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform flex items-center gap-2 font-bold"
                  >
                    <Download size={20} />
                    تحميل
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4">
                 <button 
                    onClick={() => downloadMedia(resultImage, 'saber-ai-image.png')}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/5"
                  >
                    <Download size={18} />
                    حفظ الصورة النهائية
                  </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <ImageIcon className="text-slate-700" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-300">أهلاً بك في صابر AI</h2>
              <p className="text-slate-500 max-w-xs mx-auto">
                اكتب وصفاً أو ارفع صورة لتحسينها وزيادة دقتها بضغطة زر واحدة.
              </p>
            </div>
          )}

          {(isLoading || isEnhancing) && (
            <div className="absolute inset-0 z-20 glass flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <Loader2 className="animate-spin text-blue-500" size={56} />
                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={20} />
              </div>
              <p className="text-lg font-medium animate-pulse">
                {isEnhancing ? 'جاري تحسين الجودة وإزالة البكسلات...' : 'جاري رسم المشهد بذكاء...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
