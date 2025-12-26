import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Loader2, Image } from 'lucide-react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      scannerRef.current = new Html5Qrcode("reader");
      
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError("Kamera bulunamadı");
        return;
      }

      // Arka kamerayı bul
      const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('arka')) || cameras[cameras.length - 1];

      await scannerRef.current.start(
        backCamera.id,
        {
          fps: 15,
          qrbox: undefined, // Çerçeve yok - tam ekran tarama
          aspectRatio: window.innerHeight / window.innerWidth,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        },
        (decodedText) => {
          alert('SCANNER OKUDU: ' + decodedText);
          stopScanner();
          onBarcodeDetected(decodedText);
        },
        () => {}
      );
      
      setScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      // Fallback - facingMode ile dene
      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: undefined,
            videoConstraints: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          },
          (decodedText) => {
            alert('SCANNER OKUDU: ' + decodedText);
            stopScanner();
            onBarcodeDetected(decodedText);
          },
          () => {}
        );
        setScanning(true);
      } catch (err2) {
        setError("Kamera açılamadı. İzin verin.");
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {}
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const tempScanner = new Html5Qrcode("reader-temp");
      const result = await tempScanner.scanFile(file, true);
      console.log("Dosyadan barkod:", result);
      onBarcodeDetected(result);
    } catch {
      alert("Barkod okunamadı. Tekrar deneyin.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Kamera - Tam Ekran */}
      <div id="reader" className="absolute inset-0 w-full h-full" />
      <div id="reader-temp" className="hidden" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="p-3 rounded-full bg-black/50 backdrop-blur">
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-semibold">Barkod Tara</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Tarama Çerçevesi - Görsel rehber */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-36 relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-center mb-4">
          {scanning ? "Barkodu kameraya gösterin" : "Kamera başlatılıyor..."}
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 rounded-2xl bg-white/20 backdrop-blur text-white font-medium flex items-center justify-center gap-3"
        >
          <Image className="w-5 h-5" />
          Galeriden Fotoğraf Seç
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
        <div className="absolute top-24 left-4 right-4 p-4 rounded-xl bg-red-500 text-white text-center z-20">
          {error}
        </div>
      )}

      {/* CSS Override */}
      <style>{`
        #reader {
          border: none !important;
          background: black !important;
        }
        #reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__dashboard, 
        #reader__dashboard_section,
        #reader__dashboard_section_csr,
        #reader img[alt="Info icon"],
        #reader__camera_selection,
        #reader__filescan_input {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
