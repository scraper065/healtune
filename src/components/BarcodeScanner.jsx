import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Image, Keyboard } from 'lucide-react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startScanner();
    return () => Quagga.stop();
  }, []);

  const startScanner = () => {
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      },
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "upc_e_reader",
          "code_128_reader"
        ]
      },
      locate: true,
      locator: {
        patchSize: "medium",
        halfSample: true
      }
    }, (err) => {
      if (err) {
        console.error("Quagga init error:", err);
        setError("Kamera açılamadı. İzin verin.");
        return;
      }
      Quagga.start();
      setScanning(true);
    });

    Quagga.onDetected((result) => {
      if (result?.codeResult?.code) {
        const code = result.codeResult.code;
        console.log("Barkod:", code);
        Quagga.stop();
        onBarcodeDetected(code);
      }
    });
  };

  const handleClose = () => {
    Quagga.stop();
    onClose();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Quagga.decodeSingle({
      src: URL.createObjectURL(file),
      numOfWorkers: 0,
      decoder: {
        readers: ["ean_reader", "ean_8_reader", "upc_reader"]
      }
    }, (result) => {
      if (result?.codeResult?.code) {
        Quagga.stop();
        onBarcodeDetected(result.codeResult.code);
      } else {
        const manual = prompt("Barkod okunamadı. Manuel girin:");
        if (manual?.trim()) {
          Quagga.stop();
          onBarcodeDetected(manual.trim());
        }
      }
    });
  };

  const handleManual = () => {
    const code = prompt("Barkod numarasını girin:");
    if (code?.trim()) {
      Quagga.stop();
      onBarcodeDetected(code.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Kamera */}
      <div ref={scannerRef} className="absolute inset-0 w-full h-full">
        <video className="w-full h-full object-cover" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <button onClick={handleClose} className="p-3 rounded-full bg-black/50">
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-bold text-lg">Barkod Tara</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Tarama Çerçevesi */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-32 border-2 border-emerald-400 rounded-xl relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
          {scanning && (
            <div className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500 animate-pulse" 
                 style={{ boxShadow: '0 0 8px red' }} />
          )}
        </div>
      </div>

      {/* Alt Metin ve Butonlar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/90 to-transparent">
        <p className="text-center text-white mb-4">
          {scanning ? "Barkodu çerçeveye hizalayın" : "Başlatılıyor..."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-4 rounded-xl bg-white/20 text-white font-medium flex items-center justify-center gap-2"
          >
            <Image className="w-5 h-5" /> Galeri
          </button>
          <button
            onClick={handleManual}
            className="flex-1 py-4 rounded-xl bg-white/20 text-white font-medium flex items-center justify-center gap-2"
          >
            <Keyboard className="w-5 h-5" /> Manuel
          </button>
        </div>

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
        <div className="absolute top-20 left-4 right-4 z-20 p-4 rounded-xl bg-red-500 text-white text-center">
          {error}
        </div>
      )}

      <style>{`
        #scanner-container video { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        .drawingBuffer { display: none !important; }
      `}</style>
    </div>
  );
}
