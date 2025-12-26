import React, { useRef, useState } from 'react';
import { Camera, Upload, RotateCcw, ArrowLeft } from 'lucide-react';

export default function ImageScanner({ onImage, isAnalyzing, onBack }) {
  const cameraRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Kamera erişim hatası:', error);
      alert('Kamera erişimi başarısız. Lütfen galeri seçeneğini kullanın.');
    }
  };

  const capturePhoto = () => {
    if (cameraRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      const video = cameraRef.current;
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'product.jpg', { type: 'image/jpeg' });
        setPreview(URL.createObjectURL(blob));
        onImage(file);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (cameraRef.current && cameraRef.current.srcObject) {
      cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onImage(file);
    }
  };

  const resetPreview = () => {
    setPreview(null);
  };

  if (preview && isAnalyzing) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>

        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-40 h-40 rounded-3xl overflow-hidden border border-white/20">
              <img
                src={preview}
                alt="Seçilen ürün"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-white font-medium">Ürün analiz ediliyor...</span>
            </div>
            <p className="text-slate-400 text-sm">
              Claude AI ürün fotoğrafını inceliyor. Lütfen bekleyin...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>

        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden border border-white/20 h-80">
            <img
              src={preview}
              alt="Seçilen ürün"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={resetPreview}
            className="w-full py-3 px-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-white font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Yeni Fotoğraf Çek
          </button>
        </div>
      </div>
    );
  }

  if (cameraActive) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            stopCamera();
            onBack();
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>

        <div className="space-y-4">
          <video
            ref={cameraRef}
            autoPlay
            playsInline
            className="w-full rounded-3xl border border-white/20"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            <button
              onClick={stopCamera}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-white font-medium"
            >
              İptal
            </button>
            <button
              onClick={capturePhoto}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 transition text-white font-bold flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Fotoğraf Çek
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        Geri Dön
      </button>

      <div className="space-y-4">
        <button
          onClick={startCamera}
          className="w-full group p-8 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/60 transition hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <Camera size={48} className="text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition" />
          <h3 className="font-bold text-white text-lg mb-1">Kamerayla Çek</h3>
          <p className="text-sm text-slate-300">Ürün fotoğrafını kamerayla çekin</p>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full group p-8 rounded-3xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 hover:border-teal-500/60 transition hover:shadow-lg hover:shadow-teal-500/20"
        >
          <Upload size={48} className="text-teal-400 mx-auto mb-3 group-hover:scale-110 transition" />
          <h3 className="font-bold text-white text-lg mb-1">Galeriden Seç</h3>
          <p className="text-sm text-slate-300">Telefon galerisiinden ürün fotoğrafı seçin</p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="font-bold text-white mb-2">💡 İpucu</h4>
        <p className="text-sm text-slate-300">
          En iyi sonuç için ürünün etiketini net şekilde fotoğrafla. İçerik listesi ve besin değerleri tablosu görünür olmalıdır.
        </p>
      </div>
    </div>
  );
}