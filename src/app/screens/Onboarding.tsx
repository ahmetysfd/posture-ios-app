import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Camera,
  RotateCcw,
  Check,
  Sparkles,
  AlertTriangle,
  Shield,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';
import ImageWithFallback from '../components/figma/ImageWithFallback';
import { saveUserProfile } from '../services/UserProfile';

const bodyParts = [
  { id: 'neck', label: 'Neck', image: '/welcome-pain/neck-pain.png', focus: '50% 32%' },
  { id: 'shoulders', label: 'Shoulders', image: '/welcome-pain/shoulder-pain.png', focus: '58% 45%' },
  { id: 'lower-back', label: 'Lower Back', image: '/welcome-pain/lower-back-pain.png', focus: '50% 71%', scale: 1.25 },
  { id: 'upper-back', label: 'Upper Back', image: '/welcome-pain/upper-back-pain.png', focus: '50% 40%' },
];

type Severity = 'mild' | 'moderate' | 'severe';
const findings: { label: string; severity: Severity; color: string; angle: string }[] = [
  { label: 'Forward Head',        severity: 'moderate', color: '#ff6b35', angle: '12°' },
  { label: 'Rounded Shoulders',   severity: 'mild',     color: '#00d9ff', angle: '8°'  },
  { label: 'Anterior Pelvic Tilt',severity: 'severe',   color: '#9d4edd', angle: '18°' },
  { label: 'Kyphosis',            severity: 'mild',     color: '#00d9ff', angle: '6°'  },
];

const sevColors: Record<Severity, string> = {
  mild:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  moderate: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  severe:   'text-red-400 bg-red-500/10 border-red-500/20',
};

const C = {
  0: { accent: '#ff6b35', grad: 'from-[#ff6b35] to-[#ff8f5e]', glow: 'rgba(255,107,53,0.2)', progressGrad: 'linear-gradient(90deg,#ff6b35,#ff8f5e)' },
  1: { accent: '#00d9ff', grad: 'from-[#00d9ff] to-[#00b8d4]', glow: 'rgba(0,217,255,0.2)',  progressGrad: 'linear-gradient(90deg,#00d9ff,#00b8d4)' },
  2: { accent: '#9d4edd', grad: 'from-[#9d4edd] to-[#c77dff]', glow: 'rgba(157,78,237,0.2)', progressGrad: 'linear-gradient(90deg,#9d4edd,#c77dff)' },
  3: { accent: '#ff6b35', grad: 'from-[#ff6b35] to-[#9d4edd]', glow: 'rgba(255,107,53,0.15)',progressGrad: 'linear-gradient(90deg,#ff6b35,#9d4edd)' },
} as const;

// ── Page 1: Pain Areas ──
const PainAreasPage: React.FC<{ selected: string[]; onToggle: (id: string) => void }> = ({ selected, onToggle }) => (
  <div className="flex flex-col h-full">
    <div className="px-6 pt-4 pb-5">
      <h1 className="text-[22px] font-bold text-white tracking-tight leading-snug">
        Where does it{' '}
        <span className="bg-gradient-to-r from-[#ff6b35] to-[#ff8f5e] bg-clip-text text-transparent">hurt?</span>
      </h1>
    </div>
    <div className="flex-1 overflow-y-auto px-5 pb-4">
      <div className="grid grid-cols-2 gap-2.5">
        {bodyParts.map((part) => {
          const on = selected.includes(part.id);
          return (
            <button
              key={part.id}
              type="button"
              onClick={() => onToggle(part.id)}
              className={`relative rounded-xl overflow-hidden text-left transition-transform duration-200 active:scale-[0.97] ${
                on ? 'ring-[1.5px] ring-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.15)]' : 'ring-[0.5px] ring-white/[0.06]'
              }`}
            >
              <div className="aspect-[1.2] relative">
                <ImageWithFallback src={part.image} alt={part.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: part.focus, transform: 'scale(' + (part.scale ?? 1) + ')', transformOrigin: 'center center' }} />
                <div className={`absolute inset-0 ${on ? 'bg-gradient-to-t from-[#ff6b35]/30 via-black/40 to-black/20' : 'bg-gradient-to-t from-black/70 via-black/40 to-black/10'}`} />
                {on && (
                  <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-[#ff6b35] flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <span className="text-[13px] font-semibold text-white">{part.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

// ── Page 2: Equipment ──
const EquipmentPage: React.FC<{ selected: 'band' | 'no-band' | null; onSelect: (v: 'band' | 'no-band') => void }> = ({ selected, onSelect }) => {
  const opts = [
    {
      id: 'band' as const,
      label: 'Stretch Band',
      sub: 'Resistance training included',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8c0-1.5 1-3 3-3s3 1.5 3 3v8c0 1.5 1 3 3 3s3-1.5 3-3V8c0-1.5 1-3 3-3" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="22" cy="5" r="1.5" />
        </svg>
      ),
    },
    {
      id: 'no-band' as const,
      label: 'No Equipment',
      sub: 'Bodyweight only',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          <path d="M14 10l-1 4 3 3" />
          <path d="M13 14l-3 1-1 3" />
          <path d="M9 11l4-1" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-5">
        <h1 className="text-[22px] font-bold text-white tracking-tight leading-snug">
          Your{' '}
          <span className="bg-gradient-to-r from-[#00d9ff] to-[#00b8d4] bg-clip-text text-transparent">equipment</span>
        </h1>
      </div>
      <div className="flex-1 px-5 flex flex-col gap-3 justify-center pb-16">
        {opts.map((opt) => {
          const on = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                on
                  ? 'bg-[#00d9ff]/[0.06] ring-[1.5px] ring-[#00d9ff]/50 shadow-[0_0_24px_rgba(0,217,255,0.08)]'
                  : 'bg-white/[0.02] ring-[0.5px] ring-white/[0.06] hover:bg-white/[0.03]'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                  on ? 'bg-[#00d9ff]/15 text-[#00d9ff]' : 'bg-white/[0.03] text-zinc-500'
                }`}
              >
                {opt.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className={`text-[15px] font-semibold transition-colors duration-200 ${on ? 'text-white' : 'text-zinc-300'}`}>
                  {opt.label}
                </h3>
                <p className="text-[11px] text-zinc-600 mt-0.5">{opt.sub}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                  on ? 'border-[#00d9ff] bg-[#00d9ff]' : 'border-white/10'
                }`}
              >
                {on && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Page 3: Photos ──
const PhotoCapturePage: React.FC<{
  sidePhoto: string | null;
  backPhoto: string | null;
  onCaptureSide: () => void;
  onCaptureBack: () => void;
}> = ({ sidePhoto, backPhoto, onCaptureSide, onCaptureBack }) => {
  const Row: React.FC<{ photo: string | null; label: string; onCapture: () => void }> = ({ photo, label, onCapture }) => (
    <div className="rounded-xl overflow-hidden ring-[0.5px] ring-white/[0.06] bg-[#111114]">
      <div className="flex">
        <div className="w-[38%] aspect-[0.8] relative bg-[#0a0a0f] flex items-center justify-center">
          {photo ? (
            <>
              <ImageWithFallback src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="absolute inset-0 bg-[#9d4edd]/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[1.5px] h-[65%] bg-[#9d4edd]/20 rounded-full" />
              </div>
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Check size={9} className="text-emerald-400" strokeWidth={3} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-16 border border-dashed border-[#9d4edd]/15 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 rounded-full border border-[#9d4edd]/25 mb-4" />
              </div>
              <span className="text-[8px] text-zinc-700 uppercase tracking-wider">{label.split(' ')[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1 p-3.5 flex flex-col justify-between">
          <h3 className="text-[13px] font-semibold text-white">{label}</h3>
          <button
            type="button"
            onClick={onCapture}
            className={`mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-transform active:scale-95 ${
              photo
                ? 'bg-white/[0.04] ring-[0.5px] ring-white/[0.08] text-zinc-500'
                : 'bg-gradient-to-r from-[#9d4edd] to-[#c77dff] text-white'
            }`}
          >
            {photo ? (
              <>
                <RotateCcw size={10} /> Retake
              </>
            ) : (
              <>
                <Camera size={12} /> Capture
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-5">
        <h1 className="text-[22px] font-bold text-white tracking-tight leading-snug">
          Posture{' '}
          <span className="bg-gradient-to-r from-[#9d4edd] to-[#c77dff] bg-clip-text text-transparent">scan</span>
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        <Row photo={sidePhoto} label="Side View" onCapture={onCaptureSide} />
        <Row photo={backPhoto} label="Back View" onCapture={onCaptureBack} />
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.015]">
          <Shield size={10} className="text-zinc-600 shrink-0" />
          <p className="text-[9px] text-zinc-600">Photos stay on your device.</p>
        </div>
      </div>
    </div>
  );
};

// ── Page 4: Analysis ──
const AnalysisPage: React.FC<{ painAreas: string[] }> = ({ painAreas }) => {
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-4">
        <h1 className="text-[22px] font-bold text-white tracking-tight leading-snug">
          Your{' '}
          <span className="bg-gradient-to-r from-[#ff6b35] to-[#9d4edd] bg-clip-text text-transparent">analysis</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2.5">
        {!animDone ? (
          <div className="relative rounded-xl overflow-hidden bg-[#0d0d12] ring-[0.5px] ring-white/[0.04] h-32 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-[1.5px] border-[#9d4edd]/25 border-t-[#9d4edd] rounded-full animate-spin" />
              <span className="text-[10px] text-zinc-600">Analyzing...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="relative rounded-xl overflow-hidden bg-[#111114] ring-[0.5px] ring-white/[0.06] p-3.5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#9d4edd]/[0.06] rounded-full blur-[30px]" />
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="relative w-[56px] h-[56px] shrink-0">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r="23" fill="none" stroke="url(#sg)" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 23}`}
                      strokeDashoffset={`${2 * Math.PI * 23 * 0.38}`}
                    />
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ff6b35" />
                        <stop offset="100%" stopColor="#9d4edd" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-bold text-white leading-none">62</span>
                    <span className="text-[7px] text-zinc-600 uppercase tracking-wider mt-px">Score</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-white">Needs Improvement</h3>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{findings.length} issues detected</p>
                </div>
              </div>
            </div>

            {findings.map((f) => (
              <div
                key={f.label}
                className="rounded-xl bg-[#111114] ring-[0.5px] ring-white/[0.06] p-3 flex items-center gap-2.5"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${f.color}0a`, border: `0.5px solid ${f.color}18` }}
                >
                  <AlertTriangle size={13} style={{ color: f.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-semibold text-white">{f.label}</h4>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-px rounded border ${sevColors[f.severity]}`}>
                    {f.severity}
                  </span>
                </div>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: f.color }}>
                  {f.angle}
                </span>
              </div>
            ))}

            <div className="relative rounded-xl overflow-hidden mt-0.5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#16111c] to-[#111114] rounded-xl ring-[0.5px] ring-[#9d4edd]/10" />
              <div className="absolute top-[-25%] right-[-8%] w-28 h-28 bg-[#9d4edd]/8 rounded-full blur-[35px]" />
              <div className="relative z-10 p-3.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#9d4edd] flex items-center justify-center">
                    <Sparkles size={11} className="text-white" />
                  </div>
                  <h3 className="text-[13px] font-semibold text-white">Your Program</h3>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {[
                    { icon: <Zap size={12} className="text-[#ff6b35]" />,    val: '12', unit: 'Exercises' },
                    { icon: <Clock size={12} className="text-[#00d9ff]" />,  val: '6',  unit: 'Min/Day'   },
                    { icon: <Shield size={12} className="text-[#9d4edd]" />, val: '21', unit: 'Days'      },
                  ].map((s) => (
                    <div key={s.unit} className="rounded-lg bg-white/[0.02] ring-[0.5px] ring-white/[0.04] p-2 flex flex-col items-center">
                      {s.icon}
                      <span className="text-[14px] font-bold text-white mt-0.5">{s.val}</span>
                      <span className="text-[7px] text-zinc-600 uppercase tracking-wider">{s.unit}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {findings.map((f) => (
                    <span
                      key={f.label}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ color: f.color, backgroundColor: `${f.color}0a`, border: `0.5px solid ${f.color}18` }}
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
                {painAreas.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Check size={8} className="text-emerald-400" strokeWidth={3} />
                    <span className="text-[9px] text-zinc-600">
                      Targeting {painAreas.map((id) => bodyParts.find((b) => b.id === id)?.label).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Inner flow (shared by /onboarding and /welcome) ──
export const OnboardingFlow: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const [page, setPage] = useState(0);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<'band' | 'no-band' | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);

  const togglePart = (id: string) =>
    setSelectedParts((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const simSide = () =>
    setSidePhoto('https://images.unsplash.com/photo-1767611127093-8ed12ce7789d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3N0dXJlJTIwYW5hbHlzaXMlMjBzaWRlJTIwdmlldyUyMGJvZHl8ZW58MXx8fHwxNzc2MTAxNDU5fDA&ixlib=rb-4.1.0&q=80&w=1080');
  const simBack = () =>
    setBackPhoto('https://images.unsplash.com/photo-1642522280053-d5063c56a211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2R5JTIwc2NhbiUyMGhlYWx0aCUyMHRlY2hub2xvZ3klMjBkYXJrfGVufDF8fHx8MTc3NjEwMTQ2MHww&ixlib=rb-4.1.0&q=80&w=1080');

  const canProceed =
    page === 0 ? selectedParts.length > 0 :
    page === 1 ? equipment !== null :
    page === 2 ? sidePhoto !== null && backPhoto !== null :
    true;

  const finish = () => {
    if (onFinish) {
      onFinish();
      return;
    }
    saveUserProfile({
      painAreas: selectedParts,
      hasExistingPain: selectedParts.length > 0,
      hasEquipment: equipment === 'band',
      onboardingComplete: true,
    });
    window.location.href = '/';
  };

  const goNext = () => {
    if (page < 3) setPage(page + 1);
    else finish();
  };
  const goBack = () => page > 0 && setPage(page - 1);

  const c = C[page as keyof typeof C];

  return (
    <div className="w-full h-full bg-[#0a0a0f] flex flex-col" style={{ fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif" }}>
      {/* Progress */}
      <div className="px-6 pt-4 pb-0.5">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/[0.04]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  background: C[i as keyof typeof C].progressGrad,
                  width: page >= i ? '100%' : '0%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pages */}
      <div className="flex-1 relative overflow-hidden">
        <div key={page} className="absolute inset-0 flex flex-col onboarding-page-enter">
          {page === 0 && <PainAreasPage selected={selectedParts} onToggle={togglePart} />}
          {page === 1 && <EquipmentPage selected={equipment} onSelect={setEquipment} />}
          {page === 2 && <PhotoCapturePage sidePhoto={sidePhoto} backPhoto={backPhoto} onCaptureSide={simSide} onCaptureBack={simBack} />}
          {page === 3 && <AnalysisPage painAreas={selectedParts} />}
        </div>
      </div>

      {/* Nav */}
      <div className="px-5 pb-7 pt-2 flex items-center gap-2.5">
        {page > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="w-11 h-11 rounded-xl bg-white/[0.03] ring-[0.5px] ring-white/[0.06] flex items-center justify-center active:scale-95 transition-transform"
          >
            <ChevronLeft size={16} className="text-zinc-500" />
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={!canProceed}
          className={`flex-1 h-11 rounded-xl flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-all active:scale-[0.97] ${
            canProceed ? `bg-gradient-to-r ${c.grad} text-white` : 'bg-white/[0.03] text-zinc-700 cursor-not-allowed'
          }`}
          style={canProceed ? { boxShadow: `0 0 20px ${c.glow}` } : {}}
        >
          {page === 3 ? (
            <>
              Start Program <ArrowRight size={14} />
            </>
          ) : (
            <>
              Continue <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>

      <style>{`
        .onboarding-page-enter {
          animation: onboardingFade 0.25s ease-out;
        }
        @keyframes onboardingFade {
          from { opacity: 0; transform: translateX(8%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// Standalone /onboarding route — full-device wrapper
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#0a0a0f] flex flex-col">
      <OnboardingFlow onFinish={() => navigate('/')} />
    </div>
  );
};

export default Onboarding;
