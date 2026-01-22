
import React from 'react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, isLoading }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Increase limit to 50MB
      const maxSizeBytes = 50 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        alert("ဗီဒီယိုဖိုင် အရွယ်အစား 50MB ထက် ကျော်လွန်နေပါသည်။ ပိုမိုသေးငယ်သော ဖိုင်ကို အသုံးပြုပေးပါ။");
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50 hover:border-blue-500 transition-colors group cursor-pointer relative">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
          <i className="fa-solid fa-cloud-arrow-up text-3xl text-blue-400"></i>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">ဗီဒီယိုဖိုင် ရွေးချယ်ပါ</h3>
          <p className="text-slate-400 text-sm">
            တရုတ်စကားပြော ပါဝင်သော ဗီဒီယိုဖိုင်ကို တင်ပေးပါ။ <br/> (အများဆုံး ၅၀ MB အထိ လက်ခံပါသည်)
          </p>
        </div>
        <div className="px-4 py-2 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Browse Files
        </div>
      </div>
    </div>
  );
};

export default VideoUploader;
