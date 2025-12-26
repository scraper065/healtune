import React from 'react';
import { Heart, Share2, AlertCircle, CheckCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import './ResultView.css';

export default function ResultView({
  result,
  userProfile,
  isFavorited,
  onToggleFavorite,
  onBack
}) {
  const [expandedSections, setExpandedSections] = React.useState({
    nutrition: true,
    ingredients: false,
    alerts: true,
    analysis: true,
    alternatives: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getNutrientColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getNutrientIcon = (level) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition ${
              isFavorited
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-white/10 border border-white/20 text-slate-400 hover:text-red-400'
            }`}
            title={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          >
            <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Product Header */}
      <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {result.product.name}
            </h2>
            <p className="text-slate-400 mb-3">{result.product.brand}</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-slate-300">
                {result.product.category}
              </span>
              {result.product.serving_size && (
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-slate-300">
                  Porsiyon: {result.product.serving_size}
                </span>
              )}
            </div>
          </div>
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl shadow-lg"
              style={{ backgroundColor: result.scores.health_score.color }}
            >
              {result.scores.health_score.grade}
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              {result.scores.health_score.label}
            </p>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Sağlık Puanı</p>
            <p className="font-bold text-lg text-white">{result.scores.health_score.value}/100</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Nutri Skoru</p>
            <p className="font-bold text-lg text-white">
              {result.scores.nutri_score || '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">İşlenme Derecesi</p>
            <p className="font-bold text-lg text-white">{result.scores.nova_group.value}</p>
          </div>
        </div>
      </div>

      {/* Besin Değerleri */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleSection('nutrition')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/10 transition"
        >
          <h3 className="font-bold text-white">📊 Besin Değerleri (100g)</h3>
          <ChevronDown
            size={20}
            className={`transition-transform ${expandedSections.nutrition ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.nutrition && (
          <div className="px-6 py-4 space-y-3 border-t border-white/10">
            {result.nutrition.per_100g && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Enerji</p>
                    <p className="font-bold text-white">
                      {result.nutrition.per_100g.energy.value} {result.nutrition.per_100g.energy.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Protein</p>
                    <p className="font-bold text-white">
                      {result.nutrition.per_100g.protein.value} {result.nutrition.per_100g.protein.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Karbohidrat</p>
                    <p className="font-bold text-white">
                      {result.nutrition.per_100g.carbohydrates.value} {result.nutrition.per_100g.carbohydrates.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lif</p>
                    <p className="font-bold text-white">
                      {result.nutrition.per_100g.fiber?.value ?? '-'} {result.nutrition.per_100g.fiber?.unit}
                    </p>
                  </div>
                </div>

                {/* Uyarılı Beslenler */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      {getNutrientIcon(result.nutrition.per_100g.sugar?.level)} Şeker
                    </span>
                    <span className={`font-bold ${getNutrientColor(result.nutrition.per_100g.sugar?.level)}`}>
                      {result.nutrition.per_100g.sugar.value}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      {getNutrientIcon(result.nutrition.per_100g.fat?.level)} Yağ
                    </span>
                    <span className={`font-bold ${getNutrientColor(result.nutrition.per_100g.fat?.level)}`}>
                      {result.nutrition.per_100g.fat.value}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      {getNutrientIcon(result.nutrition.per_100g.saturated_fat?.level)} Doymuş Yağ
                    </span>
                    <span className={`font-bold ${getNutrientColor(result.nutrition.per_100g.saturated_fat?.level)}`}>
                      {result.nutrition.per_100g.saturated_fat.value}g
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      {getNutrientIcon(result.nutrition.per_100g.salt?.level)} Tuz
                    </span>
                    <span className={`font-bold ${getNutrientColor(result.nutrition.per_100g.salt?.level)}`}>
                      {result.nutrition.per_100g.salt.value}g
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* İçerikler */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleSection('ingredients')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/10 transition"
        >
          <h3 className="font-bold text-white">
            🧪 İçerikler ({result.ingredients.count})
          </h3>
          <ChevronDown
            size={20}
            className={`transition-transform ${expandedSections.ingredients ? 'rotate-180' : ''}`}
          />
        </button>
        {expandedSections.ingredients && (
          <div className="px-6 py-4 space-y-3 border-t border-white/10">
            {result.ingredients.additives_count > 0 && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <p className="text-xs text-orange-300 font-medium">
                  ⚠️ {result.ingredients.additives_count} katkı maddesi içeriyor
                </p>
              </div>
            )}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {result.ingredients.items?.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${
                    item.is_additive
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-white text-sm">{item.name}</p>
                      {item.code && (
                        <p className="text-xs text-slate-400">{item.code}</p>
                      )}
                      {item.concern && (
                        <p className="text-xs text-orange-300 mt-1">{item.concern}</p>
                      )}
                    </div>
                    {item.risk_level && (
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          item.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                          item.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.risk_level === 'low' ? 'Düşük' :
                           item.risk_level === 'medium' ? 'Orta' :
                           'Yüksek'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hassasiyetler */}
      {result.sensitivity_alerts && result.sensitivity_alerts.length > 0 && (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => toggleSection('alerts')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/10 transition"
          >
            <h3 className="font-bold text-white">⚡ Hassasiyet Uyarıları</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.alerts ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.alerts && (
            <div className="px-6 py-4 space-y-3 border-t border-white/10">
              {result.sensitivity_alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    alert.severity === 'danger'
                      ? 'bg-red-500/10 border-red-500/30'
                      : alert.severity === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-green-500/10 border-green-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{alert.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-bold mb-1 ${
                        alert.severity === 'danger'
                          ? 'text-red-400'
                          : alert.severity === 'warning'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }`}>
                        {alert.title}
                      </h4>
                      <p className="text-sm text-slate-300">{alert.message}</p>
                      {alert.details && (
                        <p className="text-xs text-slate-400 mt-2">{alert.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kişisel Analiz */}
      {result.personal_analysis && (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => toggleSection('analysis')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/10 transition"
          >
            <h3 className="font-bold text-white">👤 Sizin İçin Analiz</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.analysis ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.analysis && (
            <div className="px-6 py-4 space-y-4 border-t border-white/10">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Uygunluk Puanı</span>
                  <span className="font-bold text-lg text-white">
                    {result.personal_analysis.suitability_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      result.personal_analysis.suitability_score >= 70
                        ? 'bg-green-500'
                        : result.personal_analysis.suitability_score >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${result.personal_analysis.suitability_score}%` }}
                  ></div>
                </div>
              </div>

              {result.personal_analysis.summary && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Özet</p>
                  <p className="text-white">{result.personal_analysis.summary}</p>
                </div>
              )}

              {result.personal_analysis.benefits && result.personal_analysis.benefits.length > 0 && (
                <div>
                  <p className="text-sm text-green-400 font-bold mb-2">✅ Faydaları</p>
                  <ul className="space-y-1">
                    {result.personal_analysis.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span>•</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.personal_analysis.concerns && result.personal_analysis.concerns.length > 0 && (
                <div>
                  <p className="text-sm text-red-400 font-bold mb-2">⚠️ Endişeler</p>
                  <ul className="space-y-1">
                    {result.personal_analysis.concerns.map((concern, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span>•</span> {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.personal_analysis.recommendations && result.personal_analysis.recommendations.length > 0 && (
                <div>
                  <p className="text-sm text-blue-400 font-bold mb-2">💡 Öneriler</p>
                  <ul className="space-y-1">
                    {result.personal_analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex gap-2">
                        <span>•</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alternatifler */}
      {result.alternatives && result.alternatives.length > 0 && (
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => toggleSection('alternatives')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/10 transition"
          >
            <h3 className="font-bold text-white">🔄 Daha Sağlıklı Alternatifler</h3>
            <ChevronDown
              size={20}
              className={`transition-transform ${expandedSections.alternatives ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.alternatives && (
            <div className="px-6 py-4 space-y-3 border-t border-white/10">
              {result.alternatives.map((alt, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-white">{alt.name}</h4>
                      <p className="text-sm text-slate-400">{alt.brand}</p>
                    </div>
                    <div className="text-right">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{
                          backgroundColor: alt.health_score >= 70 ? '#22C55E' :
                                          alt.health_score >= 50 ? '#F59E0B' : '#EF4444'
                        }}
                      >
                        {alt.health_score}
                      </div>
                    </div>
                  </div>
                  {alt.improvement && (
                    <p className="text-sm text-green-400 mb-2">📈 {alt.improvement}</p>
                  )}
                  <p className="text-sm text-slate-300">{alt.key_benefit}</p>
                  {alt.is_turkish && (
                    <p className="text-xs text-emerald-400 mt-2">🇹🇷 Yerli Üretim</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}