import React, { useState, useEffect } from 'react';
import { Camera, Heart, RotateCcw, Settings, BookOpen, Home } from 'lucide-react';
import ImageScanner from './components/ImageScanner';
import ResultView from './components/ResultView';
import ProfileModal from './components/ProfileModal';
import History from './components/History';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('home'); // home, scanner, results, history
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userProfile, setUserProfile] = useState({
    diseases: [],
    sensitivities: [],
    allergies: [],
    goals: []
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  // LocalStorage'dan veri yükle
  useEffect(() => {
    const saved = localStorage.getItem('gidax_profile');
    if (saved) setUserProfile(JSON.parse(saved));

    const savedHistory = localStorage.getItem('gidax_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedFavorites = localStorage.getItem('gidax_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Profile değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('gidax_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // History değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('gidax_history', JSON.stringify(history.slice(0, 50)));
  }, [history]);

  // Favorites değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('gidax_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleImageAnalysis = async (imageFile) => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: base64
                    }
                  },
                  {
                    type: 'text',
                    text: `Bu gıda ürününü detaylı analiz et. Sadece JSON formatında yanıt ver. Yanıt örneği:
{
  "product": {
    "name": "Ürün adı",
    "brand": "Marka",
    "category": "Kategori",
    "serving_size": "Porsiyon"
  },
  "scores": {
    "health_score": {
      "value": 0-100,
      "grade": "A/B/C/D/E",
      "label": "Türkçe etiket",
      "color": "#HEX"
    },
    "nutri_score": "A/B/C/D/E veya null",
    "nova_group": {
      "value": 1-4,
      "label": "Türkçe açıklama"
    }
  },
  "nutrition": {
    "per_100g": {
      "energy": {"value": 0, "unit": "kcal"},
      "protein": {"value": 0, "unit": "g"},
      "carbohydrates": {"value": 0, "unit": "g"},
      "sugar": {"value": 0, "unit": "g", "level": "low/medium/high"},
      "fat": {"value": 0, "unit": "g", "level": "low/medium/high"},
      "saturated_fat": {"value": 0, "unit": "g", "level": "low/medium/high"},
      "fiber": {"value": 0, "unit": "g"},
      "salt": {"value": 0, "unit": "g", "level": "low/medium/high"}
    },
    "levels_summary": {
      "sugar": {"level": "low/medium/high", "label_tr": "Düşük/Orta/Yüksek", "icon": "🟢/🟡/🔴"},
      "fat": {"level": "low/medium/high", "label_tr": "Düşük/Orta/Yüksek", "icon": "🟢/🟡/🔴"},
      "saturated_fat": {"level": "low/medium/high", "label_tr": "Düşük/Orta/Yüksek", "icon": "🟢/🟡/🔴"},
      "salt": {"level": "low/medium/high", "label_tr": "Düşük/Orta/Yüksek", "icon": "🟢/🟡/🔴"}
    }
  },
  "ingredients": {
    "raw_text": "İçerikler listesi",
    "count": 0,
    "items": [
      {
        "name": "İçerik adı",
        "code": "E kodu veya null",
        "is_additive": true/false,
        "risk_score": 0-100,
        "risk_level": "low/medium/high",
        "concern": "Açıklama veya null",
        "halal_status": "halal/haram/şüpheli/bilinmiyor"
      }
    ],
    "additives_count": 0,
    "additives_list": []
  },
  "sensitivity_alerts": [
    {
      "type": "helal/boykot/vegan/vejetaryen/yerli/diyabet/hipertansiyon/kolesterol/gluten/laktoz",
      "status": "success/warning/danger",
      "icon": "emoji",
      "title": "Başlık",
      "message": "Açıklama",
      "severity": "success/warning/danger"
    }
  ],
  "personal_analysis": {
    "suitability": "suitable/partially_suitable/not_suitable",
    "suitability_score": 0-100,
    "summary": "Kısa özet",
    "recommendations": ["Öneri 1", "Öneri 2"],
    "benefits": ["Fayda 1"],
    "concerns": ["Endişe 1"]
  },
  "alternatives": [
    {
      "name": "Alternatif adı",
      "brand": "Marka",
      "health_score": 0-100,
      "improvement": "İyileşme",
      "key_benefit": "Ana avantaj",
      "is_turkish": true/false
    }
  ],
  "metadata": {
    "confidence": 0-1,
    "analyzed_at": "ISO timestamp"
  }
}

ÖNEMLİ: Helal kontrolleri:
- Haram E kodları: E120, E441, E542, E631, E635, E904, E920, E921
- Şüpheli E kodları (hayvan kökenli olabilir): E422, E471, E472a-e, E473-478, E481-483, E491-495
- Haram malzemeler: domuz, alkol, şarap, bira, jelatin
- Helal uyumlu ise ☪️ ikonu + "Helal Uyumlu" mesajı koy

Boykot markaları: coca-cola, pepsi, nestle, starbucks, unilever, danone, kraft, mondelez, mars, johnson, loreal, gillette, procter

Türk markaları: ülker, eti, torku, tadım, peyman, tat, tukaş, pınar, sütaş, uludağ

Vegan kontrolü: et, süt, yumurta, bal, jelatin, peynir, tereyağ, krema, laktoz, kazein`
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data.content[0].text;

        // JSON'u çıkart
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON bulunamadı');
        }

        const analysis = JSON.parse(jsonMatch[0]);
        
        // History'ye ekle
        setHistory(prev => [{
          ...analysis,
          id: Date.now(),
          timestamp: new Date().toISOString()
        }, ...prev]);

        setResult(analysis);
        setScreen('results');
      };

      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error('Analiz hatası:', error);
      alert('Ürün analiz edilemedi. Lütfen daha net bir fotoğraf çekin.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFavorite = (product) => {
    const isFavorited = favorites.some(f => f.product.name === product.product.name);
    if (isFavorited) {
      setFavorites(favorites.filter(f => f.product.name !== product.product.name));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  const isFavorited = result && favorites.some(f => f.product.name === result.product.name);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">GidaX</h1>
              <p className="text-xs text-slate-400">Türkiye'nin Gıda Analiz AI'sı</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {screen !== 'home' && (
              <button
                onClick={() => setScreen('home')}
                className="p-2 hover:bg-white/10 rounded-full transition"
                title="Ana sayfa"
              >
                <Home size={20} className="text-white" />
              </button>
            )}
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 hover:bg-white/10 rounded-full transition"
              title="Profil ayarları"
            >
              <Settings size={20} className="text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pb-20">
        {screen === 'home' && (
          <div className="py-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">
                Gıda Ürünlerini Analiz Et
              </h2>
              <p className="text-slate-400">
                Besin değerlerini, katkı maddelerini ve sağlık etkisini anında öğren
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setScreen('scanner')}
                className="group col-span-2 p-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-500/60 transition hover:shadow-lg hover:shadow-emerald-500/20"
              >
                <Camera size={32} className="text-emerald-400 mb-2 group-hover:scale-110 transition" />
                <h3 className="font-bold text-white mb-1">Ürün Tara</h3>
                <p className="text-sm text-slate-300">Kamera veya galeriden fotoğraf çek</p>
              </button>

              <button
                onClick={() => setScreen('history')}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition hover:bg-white/10"
              >
                <BookOpen size={24} className="text-white mb-1 mx-auto" />
                <h3 className="font-bold text-white text-sm">Geçmiş</h3>
                <p className="text-xs text-slate-400">{history.length} ürün</p>
              </button>

              <button
                onClick={() => setScreen('favorites')}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition hover:bg-white/10"
              >
                <Heart size={24} className="text-red-400 mb-1 mx-auto" />
                <h3 className="font-bold text-white text-sm">Favoriler</h3>
                <p className="text-xs text-slate-400">{favorites.length} ürün</p>
              </button>
            </div>

            {/* Son Analiz */}
            {history.length > 0 && (
              <div className="mt-12">
                <h3 className="text-sm font-bold text-slate-300 mb-4">Son Analiz</h3>
                <div
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition"
                  onClick={() => {
                    setResult(history[0]);
                    setScreen('results');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white">{history[0].product.name}</h4>
                      <p className="text-sm text-slate-400">{history[0].product.brand}</p>
                    </div>
                    <div className="text-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                        style={{ backgroundColor: history[0].scores.health_score.color }}
                      >
                        {history[0].scores.health_score.grade}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'scanner' && (
          <div className="py-8">
            <ImageScanner
              onImage={handleImageAnalysis}
              isAnalyzing={isAnalyzing}
              onBack={() => setScreen('home')}
            />
          </div>
        )}

        {screen === 'results' && result && (
          <div className="py-8">
            <ResultView
              result={result}
              userProfile={userProfile}
              isFavorited={isFavorited}
              onToggleFavorite={() => toggleFavorite(result)}
              onBack={() => setScreen('home')}
            />
          </div>
        )}

        {screen === 'history' && (
          <History
            items={history}
            onSelect={(item) => {
              setResult(item);
              setScreen('results');
            }}
            onBack={() => setScreen('home')}
          />
        )}

        {screen === 'favorites' && (
          <History
            items={favorites}
            title="Favoriler"
            onSelect={(item) => {
              setResult(item);
              setScreen('results');
            }}
            onBack={() => setScreen('home')}
          />
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={userProfile}
          onSave={(newProfile) => {
            setUserProfile(newProfile);
            setShowProfileModal(false);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}