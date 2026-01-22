
import React, { useState, useRef } from 'react';
import VideoUploader from './components/VideoUploader';
import TranslationProgress from './components/TranslationProgress';
import { SubtitleEntry, TranslationStatus } from './types';
import { translateVideoToMyanmar, fileToBase64, generateSrtContent } from './services/geminiService';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [status, setStatus] = useState<TranslationStatus>({
    step: 'idle',
    progress: 0,
    message: 'အဆင်သင့်ဖြစ်ပါပြီ'
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setSubtitles([]);
    setStatus({ step: 'uploading', progress: 10, message: 'ဗီဒီယိုဖိုင်ကို ပြင်ဆင်နေပါသည်...' });

    try {
      const base64 = await fileToBase64(file);
      setStatus({ step: 'analyzing', progress: 20, message: 'AI မှ စတင်စစ်ဆေးနေပါသည် (50MB အထိ လက်ခံထားပါသည်)...' });
      
      const results = await translateVideoToMyanmar(
        base64, 
        (msg, prog) => {
          setStatus(prev => ({ ...prev, message: msg, progress: prog }));
        },
        file.type
      );

      setSubtitles(results);
      setStatus({ step: 'completed', progress: 100, message: 'ဘာသာပြန်ခြင်း အောင်မြင်ပါသည်။' });
    } catch (error: any) {
      console.error(error);
      setStatus({ step: 'error', progress: 0, message: error.message || 'Error occurred during translation' });
    }
  };

  const handleRemove = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setSubtitles([]);
    setStatus({ step: 'idle', progress: 0, message: 'အဆင်သင့်ဖြစ်ပါပြီ' });
  };

  const downloadSrt = () => {
    const srtContent = generateSrtContent(subtitles);
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoFile?.name?.split('.')[0] || 'translated'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <i className="fa-solid fa-language text-xl"></i>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Chinese to Myanmar AI
            </h1>
          </div>
          {videoFile && (
            <button
              onClick={handleRemove}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <i className="fa-solid fa-trash-can"></i>
              Remove Video
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-12">
        {!videoFile ? (
          <div className="space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold myanmar-text leading-tight text-white">
                တရုတ်ဗီဒီယိုများကို <span className="text-blue-500">မြန်မာလို</span> ဘာသာပြန်ကြစို့
              </h2>
              <p className="text-slate-400 text-lg">
                တရုတ်စကားပြော ပါဝင်သော ဗီဒီယိုများမှ dialogue များကို နားလည်လွယ်သော မြန်မာစကားပြောများအဖြစ် AI ဖြင့် အလိုအလျောက် ပြောင်းလဲပေးပါသည်။
              </p>
            </div>
            <VideoUploader onFileSelect={handleFileSelect} isLoading={status.step !== 'idle' && status.step !== 'completed'} />
            
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors">
                <i className="fa-solid fa-bolt text-yellow-400 mb-2 text-xl"></i>
                <h4 className="font-bold mb-1 text-slate-200">Fast Processing</h4>
                <p className="text-slate-500">Gemini 3 Flash AI delivers rapid results.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors">
                <i className="fa-solid fa-file-code text-blue-400 mb-2 text-xl"></i>
                <h4 className="font-bold mb-1 text-slate-200">SRT Export</h4>
                <p className="text-slate-500">Downloadable subtitle files with accurate timestamps.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-colors">
                <i className="fa-solid fa-people-arrows text-emerald-400 mb-2 text-xl"></i>
                <h4 className="font-bold mb-1 text-slate-200">Natural Language</h4>
                <p className="text-slate-500">Colloquial Myanmar translation styles.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/5 border border-slate-800">
                <video
                  ref={videoRef}
                  src={videoUrl || ''}
                  controls
                  className="w-full h-full"
                />
              </div>
              {status.step !== 'completed' && status.step !== 'error' && (
                <TranslationProgress status={status} />
              )}
              {status.step === 'error' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 flex items-start gap-3">
                  <i className="fa-solid fa-circle-exclamation mt-1"></i>
                  <div>
                    <h4 className="font-bold">အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်</h4>
                    <p className="text-sm opacity-80">{status.message}</p>
                    <button 
                       onClick={() => handleFileSelect(videoFile)}
                       className="mt-2 text-xs font-bold underline hover:opacity-80"
                    >
                      ပြန်လည်ကြိုးစားမည်
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[600px] shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 sticky top-0 z-10">
                <h3 className="font-bold flex items-center gap-2 text-slate-200">
                  <i className="fa-solid fa-list-ul text-blue-400"></i>
                  ဘာသာပြန် ရလဒ်များ
                </h3>
                {subtitles.length > 0 && (
                  <button
                    onClick={downloadSrt}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-bold transition-all transform hover:scale-105 text-white"
                  >
                    <i className="fa-solid fa-download"></i>
                    Download SRT
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {subtitles.length === 0 && status.step !== 'completed' && status.step !== 'error' ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin"></div>
                    <p className="myanmar-text">ဘာသာပြန်နေဆဲဖြစ်ပါသည်...</p>
                  </div>
                ) : subtitles.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-8">
                    <i className="fa-solid fa-comment-slash text-4xl mb-4 opacity-20"></i>
                    <p className="myanmar-text text-sm">စကားပြောများကို ရှာမတွေ့ပါ။ ဗီဒီယိုတွင် တရုတ်စကားပြော ပါဝင်ကြောင်း သေချာပါစေ။</p>
                  </div>
                ) : (
                  subtitles.map((sub) => (
                    <div 
                      key={sub.id} 
                      className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (videoRef.current) {
                          const parts = sub.startTime.split(/[:,]/);
                          const seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]) + parseInt(parts[3]) / 1000;
                          videoRef.current.currentTime = seconds;
                          videoRef.current.play();
                        }
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-mono bg-slate-700 px-2 py-0.5 rounded text-slate-400 group-hover:text-blue-300 transition-colors">
                          {sub.startTime} → {sub.endTime}
                        </span>
                        <span className="text-[10px] text-slate-600 font-bold">#{sub.id}</span>
                      </div>
                      <p className="myanmar-text text-sm leading-relaxed text-slate-200">
                        {sub.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {subtitles.length > 0 && (
        <div className="fixed bottom-6 right-6 lg:hidden">
           <button
             onClick={downloadSrt}
             className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 hover:bg-emerald-700 transition-all active:scale-95 text-white"
           >
             <i className="fa-solid fa-file-arrow-down text-xl"></i>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
