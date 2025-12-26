import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, Image, Loader2 } from 'lucide-react';

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
        console.error('Quagga init error:', err);
        setError('Kamera açılamadı. İzin verin.');
        return;
      }
      Quagga.start();
      setScanning(true);
    });

    Quagga.onDetected((result) => {
      if (result?.codeResult?.code) {
        const code = result.codeResult.code;
        console.log('Barkod:', code);
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
        const manual = prompt('Barkod okunamadı. Manuel girin:');
        if (manual?.trim()) {
          Quagga.stop();
          onBarcodeDetected(manual.trim());
        }
      }
    });
  };

  const handleManual = () => {
    const code = prompt('Barkod numarası:');
    if (code?.trim()) {
      Quagga.stop();
      onBarcodeDetected(code.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Scanner */}
      <div ref={scannerRef} className="absolute inset-0 w-full h-full">
        <video className="w-full h-full object-cover" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <button onClick={handleClose} className="p-3 rounded-full bg-black/50">
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-bold">Barkod Tara</span>
          <div className="w-12" />
        </div>
      </div>

      {/* Frame */}
      <div className="flex-1 flex items-center justify-center relative z-10 pointer-events-none">
        <div className="w-72 h-40 border-4 border-emerald-400 rounded-2xl" 
             style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}>
          {scanning && (
            <div className="absolute inset-x-4 h-1 bg-emerald-400 top-1/2 rounded animate-pulse"
                 style={{ boxShadow: '0 0 10px #10b981' }} />
          )}
        </div>
      </div>

      {/* Status */}
      <div className="relative z-10 text-center mb-4">
        {scanning ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Taranıyor...</span>
          </div>
        ) : (
          <span className="text-white/70">Başlatılıyor...</span>
        )}
      </div>

      {/* Buttons */}
      <div className="relative z-10 p-6 bg-gradient-to-t from-black to-transparent space-y-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-4 rounded-2xl bg-white/20 text-white font-medium flex items-center justify-center gap-2"
        >
          <Image className="w-5 h-5" />
          Galeriden Seç
        </button>
        
        <button onClick={handleManual} className="w-full py-3 rounded-xl bg-white/10 text-white/70">
          Manuel Gir
        </button>
        
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Error */}
      {error && (
        <div className="absolute top-24 left-4 right-4 p-4 rounded-xl bg-red-500 text-white text-center z-20">
          {error}
          <button onClick={handleManual} className="block w-full mt-2 py-2 bg-white/20 rounded-lg">
            Manuel Gir
          </button>
        </div>
      )}

      <style>{`
        #scannerRef video, .drawingBuffer { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        canvas.drawingBuffer { display: none !important; }
      `}</style>
    </div>
  );
}
