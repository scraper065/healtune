import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Image, Loader2 } from 'lucide-react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasCamera, setHasCamera] = useState(true);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Kamera hatası:', err);
      setError('Kamera açılamadı. İzin verin veya galeriden seçin.');
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Görüntüyü al
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // BarcodeDetector API kullan (modern tarayıcılar)
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
        });
        
        const barcodes = await barcodeDetector.detect(video);
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0].rawValue;
          alert('Barkod bulundu: ' + barcode);
          stopCamera();
          onBarcodeDetected(barcode);
          return;
        }
      } catch (err) {
        console.log('BarcodeDetector hatası:', err);
      }
    }

    // Manuel giriş için prompt
    const manualBarcode = prompt('Barkod otomatik okunamadı.\n\nBarkod numarasını manuel girin:');
    if (manualBarcode && manualBarcode.trim()) {
      stopCamera();
      onBarcodeDetected(manualBarcode.trim());
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = document.createElement('img');
    const reader = new FileReader();

    reader.onload = async (event) => {
      img.src = event.target.result;
      
      img.onload = async () => {
        // BarcodeDetector ile dene
        if ('BarcodeDetector' in window) {
          try {
            const barcodeDetector = new BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
            });
            
            const barcodes = await barcodeDetector.detect(img);
            
            if (barcodes.length > 0) {
              const barcode = barcodes[0].rawValue;
              alert('Dosyadan barkod: ' + barcode);
              onBarcodeDetected(barcode);
              return;
            }
          } catch (err) {
            console.log('Dosya tarama hatası:', err);
          }
        }

        // Manuel giriş
        const manualBarcode = prompt('Barkod okunamadı.\n\nBarkod numarasını manuel girin:');
        if (manualBarcode && manualBarcode.trim()) {
          onBarcodeDetected(manualBarcode.trim());
        }
      };
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Video - Tam Ekran */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Canvas (gizli) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="relative z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => { stopCamera(); onClose(); }}
            className="p-3 rounded-full bg-black/50"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-bold text-lg">Barkod Tara</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Tarama Çerçevesi */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-72 h-40 relative">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          
          {/* Tarama çizgisi animasyonu */}
          <div 
            className="absolute left-2 right-2 h-1 bg-emerald-400 rounded-full animate-pulse"
            style={{
              top: '50%',
              boxShadow: '0 0 10px #10b981, 0 0 20px #10b981'
            }}
          />
        </div>
      </div>

      {/* Alt Butonlar */}
      <div className="relative z-10 p-6 bg-gradient-to-t from-black/90 to-transparent space-y-4">
        {hasCamera && (
          <button
            onClick={captureAndScan}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-3"
          >
            <Camera className="w-6 h-6" />
            Tara / Çek
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 rounded-2xl bg-white/20 text-white font-medium flex items-center justify-center gap-3"
        >
          <Image className="w-5 h-5" />
          Galeriden Seç
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => {
            const barcode = prompt('Barkod numarasını girin:');
            if (barcode && barcode.trim()) {
              stopCamera();
              onBarcodeDetected(barcode.trim());
            }
          }}
          className="w-full py-3 rounded-xl bg-white/10 text-white/70 text-sm"
        >
          Manuel Barkod Gir
        </button>
      </div>

      {/* Hata */}
      {error && (
        <div className="absolute top-24 left-4 right-4 p-4 rounded-xl bg-red-500/90 text-white text-center z-20">
          {error}
        </div>
      )}
    </div>
  );
}
