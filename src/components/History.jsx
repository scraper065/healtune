import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function History({ items, title = 'Analiz Geçmişi', onSelect, onBack }) {
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);

  const handleDelete = (id) => {
    // Delete functionality would be here
    setDeleteConfirm(null);
  };

  if (items.length === 0) {
    return (
      <div className="py-12 space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>

        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">{title} Boş</h3>
          <p className="text-slate-400">
            Henüz hiçbir ürün analiz etmeddiniz
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        Geri Dön
      </button>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/30 transition cursor-pointer group"
              onClick={() => onSelect(item)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 group-hover:text-white transition">
                  <h4 className="font-bold text-white">{item.product.name}</h4>
                  <p className="text-sm text-slate-400 mb-2">{item.product.brand}</p>
                  {item.timestamp && (
                    <p className="text-xs text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: item.scores.health_score.color }}
                  >
                    {item.scores.health_score.grade}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.scores.health_score.value}
                  </p>
                </div>
              </div>

              {/* Inline Nutrition Summary */}
              <div className="mt-3 pt-3 border-t border-white/10 flex gap-2 text-xs">
                <span className={item.nutrition.per_100g.sugar?.level === 'high' ? 'text-red-400' : 'text-slate-400'}>
                  🍬 Şeker: {item.nutrition.per_100g.sugar.value}g
                </span>
                <span className={item.nutrition.per_100g.salt?.level === 'high' ? 'text-red-400' : 'text-slate-400'}>
                  🧂 Tuz: {item.nutrition.per_100g.salt.value}g
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}