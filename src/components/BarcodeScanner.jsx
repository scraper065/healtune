import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Loader2, Image, Camera } from 'lucide-react';

export default function BarcodeScanner({ onBarcodeDetected, onClose }) {
  const [isStarting, setIsStarting] = useState(true);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    const startScanner = async () => {
      try {
        scannerRef.current = new Html5Qrcode("reader");
        
        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 }
          },
          (decodedText) => {
            if (mounted) {
              scannerRef.current?.stop();
              onBarcodeDetected(decodedText);
            }
          },
          () => {}
        );
        
        if (mounted) setIsStarting(false);
      } catch (err) {
        if (mounted) {
          setError("Kamera açılamadı");
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      scannerRef.current?.stop().catch(() => {});
    };
  }, [onBarcodeDetected]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("reader-file");
      const result = await html5QrCode.scanFile(file, true);
      onBarcodeDetected(result);
    } catch {
      setError("Barkod okunamadı");
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <button 
          onClick={onClose}
          style={{
            padding: '10px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <X color="white" size={24} />
        </button>
        <span style={{ color: 'white', fontWeight: 'bold' }}>Barkod Tara</span>
        <div style={{ width: 44 }} />
      </div>

      {/* Camera Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div id="reader" style={{ width: '100%', height: '100%' }} />
        <div id="reader-file" style={{ display: 'none' }} />
        
        {/* Overlay Frame */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: 280,
            height: 160,
            border: '3px solid #10b981',
            borderRadius: 16,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
          }} />
        </div>

        {/* Loading */}
        {isStarting && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)'
          }}>
            <Loader2 color="#10b981" size={48} className="animate-spin" />
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'white', marginBottom: 16 }}>
          Barkodu çerçeveye hizalayın
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '12px 24px',
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Image size={20} />
          Galeriden Seç
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 16,
          right: 16,
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#ef4444',
          color: 'white',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <style>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #reader {
          border: none !important;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__dashboard {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
