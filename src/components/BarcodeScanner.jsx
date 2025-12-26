import React, { useEffect, useRef, useState } from 'react';
import { X, Image, Loader2 } from 'lucide-react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('Kamera başlatılıyor...');
  const streamRef = useRef(null);
  const scanningRef = useRef(false);
  const detectorRef = useRef(null);

  useEffect(() => {
    initScanner();
    return () => stopScanner();
  }, []);

  const initScanner = async () => {
    // BarcodeDetector desteğini kontrol et
    if (!('BarcodeDetector' in window)) {
      setError('Bu tarayıcı barkod okumayı desteklemiyor. Manuel girin veya Chrome kullanın.');
      return;
    }

    try {
      detectorRef.current = new BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        setStatus('Barkodu kameraya gösterin');
        scanningRef.current = true;
        startContinuousScan();
      }
    } catch (err) {
      console.error('Kamera hatası:', err);
      setError('Kamera açılamadı. İzin verin.');
    }
  };

  const startContinuousScan = async () => {
    if (!scanningRef.current || !detectorRef.current || !videoRef.current) return;

    try {
      const barcodes = await detectorRef.current.detect(videoRef.current);
      
      if (barcodes.length > 0) {
        const barcode = barcodes[0].rawValue;
        console.log('Barkod bulundu:', barcode);
        scanningRef.current = false;
        stopScanner();
        onBarcodeDetected(barcode);
        return;
      }
    } catch (err) {
      // Tarama devam ediyor
    }

    // 100ms sonra tekrar tara
    if (scanningRef.current) {
      requestAnimationFrame(() => {
        setTimeout(startContinuousScan, 100);
      });
    }
  };

  const stopScanner = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!('BarcodeDetector' in window)) {
      const manual = prompt('Manuel barkod girin:');
      if (manual) onBarcodeDetected(manual.trim());
      return;
    }

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      try {
        const detector = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
        });
        const barcodes = await detector.detect(img);
        
        if (barcodes.length > 0) {
          stopScanner();
          onBarcodeDetected(barcodes[0].rawValue);
        } else {
          const manual = prompt('Barkod bulunamadı. Manuel girin:');
          if (manual) {
            stopScanner();
            onBarcodeDetected(manual.trim());
          }
        }
      } catch (err) {
        const manual = prompt('Okuma hatası. Manuel girin:');
        if (manual) {
          stopScanner();
          onBarcodeDetected(manual.trim());
        }
      }
      URL.revokeObjectURL(img.src);
    };
  };

  const handleManualEntry = () => {
    const barcode = prompt('Barkod numarasını girin:');
    if (barcode && barcode.trim()) {
      stopScanner();
      onBarcodeDetected(barcode.trim());
    }
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

      {/* Header */}
      <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { stopScanner(); onClose(); }}
            className="p-3 rounded-full bg-black/50 backdrop-blur"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-bold">Barkod Tara</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Tarama Çerçevesi */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-72 h-40 relative">
          {/* Köşeler */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl" />

          {/* Tarama çizgisi */}
          {scanning && (
            <div
              className="absolute left-4 right-4 h-1 bg-emerald-400 rounded-full"
              style={{
                top: '50%',
                boxShadow: '0 0 15px #10b981, 0 0 30px #10b981',
                animation: 'scanline 1.5s ease-in-out infinite'
              }}
            />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="relative z-10 text-center mb-4">
        {scanning ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{status}</span>
          </div>
        ) : (
          <span className="text-white/70">{status}</span>
        )}
      </div>

      {/* Alt Butonlar */}
      <div className="relative z-10 p-6 bg-gradient-to-t from-black/90 to-transparent space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 rounded-2xl bg-white/20 backdrop-blur text-white font-medium flex items-center justify-center gap-3"
        >
          <Image className="w-5 h-5" />
          Galeriden Seç
        </button>

        <button
          onClick={handleManualEntry}
          className="w-full py-3 rounded-xl bg-white/10 text-white/70 text-sm"
        >
          Manuel Barkod Gir
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Hata */}
      {error && (
        <div className="absolute top-24 left-4 right-4 p-4 rounded-xl bg-red-500/90 text-white text-center z-20">
          {error}
          <button
            onClick={handleManualEntry}
            className="block w-full mt-3 py-2 bg-white/20 rounded-lg"
          >
            Manuel Gir
          </button>
        </div>
      )}

      {/* CSS */}
      <style>{`
        @keyframes scanline {
          0%, 100% { transform: translateY(-30px); opacity: 0.5; }
          50% { transform: translateY(30px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
