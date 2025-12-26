import React, { useState } from 'react';
import { X } from 'lucide-react';

const DISEASE_OPTIONS = [
  { id: 'diyabet', label: '🩸 Diyabet' },
  { id: 'hipertansiyon', label: '💓 Hipertansiyon' },
  { id: 'kolesterol', label: '🫀 Yüksek Kolesterol' },
  { id: 'gluten', label: '🌾 Gluten Hassasiyeti' },
  { id: 'laktoz', label: '🥛 Laktoz İntoleransı' }
];

const SENSITIVITY_OPTIONS = [
  { id: 'halal', label: '☪️ Helal Ürünler' },
  { id: 'boykot', label: '✊ Boykot Markaları' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'vejetaryen', label: '🥬 Vejetaryen' },
  { id: 'yerli', label: '🇹🇷 Yerli Ürünler' }
];

const GOAL_OPTIONS = [
  { id: 'weight_loss', label: '📉 Kilo Verme' },
  { id: 'muscle_gain', label: '💪 Kas Kazanma' },
  { id: 'health', label: '💚 Genel Sağlık' },
  { id: 'energy', label: '⚡ Enerji' },
  { id: 'clean_eating', label: '🥗 Temiz Beslenme' }
];

export default function ProfileModal({ profile, onSave, onClose }) {
  const [newProfile, setNewProfile] = useState(profile);

  const toggleItem = (category, id) => {
    setNewProfile(prev => {
      const list = prev[category] || [];
      if (list.includes(id)) {
        return {
          ...prev,
          [category]: list.filter(item => item !== id)
        };
      } else {
        return {
          ...prev,
          [category]: [...list, id]
        };
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full rounded-t-3xl bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Profil Ayarları</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Hastalıklar */}
          <div>
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <span>🏥</span> Sağlık Durumu
            </h3>
            <div className="space-y-2">
              {DISEASE_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleItem('diseases', option.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                    newProfile.diseases?.includes(option.id)
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hassasiyetler */}
          <div>
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <span>⚡</span> Hassasiyetler
            </h3>
            <div className="space-y-2">
              {SENSITIVITY_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleItem('sensitivities', option.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                    newProfile.sensitivities?.includes(option.id)
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hedefler */}
          <div>
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <span>🎯</span> Beslenme Hedefleri
            </h3>
            <div className="space-y-2">
              {GOAL_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleItem('goals', option.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                    newProfile.goals?.includes(option.id)
                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 pt-4 pb-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium transition"
            >
              İptal
            </button>
            <button
              onClick={() => onSave(newProfile)}
              className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white font-bold transition"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}