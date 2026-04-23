import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Camera,
  RotateCcw,
  Check,
  Shield,
  ArrowRight,
} from 'lucide-react';
import ImageWithFallback from '../components/figma/ImageWithFallback';
import ScanAnalysisView from '../components/ScanAnalysisView';
import { saveUserProfile, loadUserProfile, levelToDefaultDifficulty } from '../services/UserProfile';
import {
  initPoseDetector,
  detectPose,
  validatePoseForView,
  type Keypoint,
} from '../services/MoveNetPoseService';
import { type IntendedView } from '../services/PostureAnalysisEngine';
import {
  analyzeThreePhotos,
  determineLevel,
  type ScanReport,
} from '../services/PostureAnalysisEngineV2';
import { scanReportToPostureReport } from '../services/scanReportAdapter';
import { appendLocalScanLog, buildLocalScanEntry } from '../services/scanPersistence';
import { generateAndStoreDailyProgram, initLevelSystem } from '../services/DailyProgram';

const bodyParts = [
  { id: 'neck', label: 'Neck', image: '/welcome-pain/neck-pain.png', focus: '50% 32%' },
  { id: 'shoulders', label: 'Shoulders', image: '/welcome-pain/shoulder-pain.png', focus: '58% 45%' },
  { id: 'lower-back', label: 'Lower Back', image: '/welcome-pain/lower-back-pain.png', focus: '50% 71%', scale: 1.25 },
  { id: 'upper-back', label: 'Upper Back', image: '/welcome-pain/upper-back-pain.png', focus: '50% 40%' },
];

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

// ── Page 3: Photos ──────────────────────────────────
const PhotoCapturePage: React.FC<{
  frontPhoto: string | null;
  sidePhoto: string | null;
  backPhoto: string | null;
  onCaptureCamera: (slot: 'front' | 'side' | 'back') => void;
  onCaptureUpload: (slot: 'front' | 'side' | 'back') => void;
}> = ({ frontPhoto, sidePhoto, backPhoto, onCaptureCamera, onCaptureUpload }) => {
  const Row: React.FC<{
    photo: string | null;
    label: string;
    slot: 'front' | 'side' | 'back';
    onCamera: () => void;
    onUpload: () => void;
  }> = ({ photo, label, onCamera, onUpload }) => (
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
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              onClick={onCamera}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-transform active:scale-95 ${
                photo
                  ? 'bg-white/[0.04] ring-[0.5px] ring-white/[0.08] text-zinc-500'
                  : 'bg-gradient-to-r from-[#9d4edd] to-[#c77dff] text-white'
              }`}
            >
              {photo ? <><RotateCcw size={10} /> Retake</> : <><Camera size={12} /> Camera</>}
            </button>
            <button
              type="button"
              onClick={onUpload}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold bg-white/[0.04] ring-[0.5px] ring-white/[0.08] text-zinc-400 transition-transform active:scale-95"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload
            </button>
          </div>
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
        <Row photo={frontPhoto} label="Front View" slot="front" onCamera={() => onCaptureCamera('front')} onUpload={() => onCaptureUpload('front')} />
        <Row photo={sidePhoto}  label="Side View"  slot="side"  onCamera={() => onCaptureCamera('side')}  onUpload={() => onCaptureUpload('side')}  />
        <Row photo={backPhoto}  label="Back View"  slot="back"  onCamera={() => onCaptureCamera('back')}  onUpload={() => onCaptureUpload('back')}  />
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.015]">
          <Shield size={10} className="text-zinc-600 shrink-0" />
          <p className="text-[9px] text-zinc-600">Photos stay on your device.</p>
        </div>
      </div>
    </div>
  );
};
// ── Page 4: Analysis (runs real scan, shows risk analysis cards) ──
const AnalysisPage: React.FC<{
  photos: { front: string; side: string; back: string };
}> = ({ photos }) => {
  const [phase, setPhase] = useState<'analyzing' | 'done' | 'error'>('analyzing');
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);
  const [kps, setKps] = useState<{ front: Keypoint[]; side: Keypoint[]; back: Keypoint[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        await initPoseDetector();
        const allKps: Record<IntendedView, Keypoint[]> = { front: [], side: [], back: [] };

        for (const view of ['front', 'side', 'back'] as IntendedView[]) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = photos[view];
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error('img'));
          });
          const result = await detectPose(img);
          if (!result) {
            setErrorMsg(`No pose detected in ${view} photo. Please retake.`);
            setPhase('error');
            return;
          }
          const validation = validatePoseForView(result, view);
          if (!validation.valid) {
            setErrorMsg(validation.reason ?? `Pose validation failed for ${view}.`);
            setPhase('error');
            return;
          }
          allKps[view] = result.keypoints;
        }

        const scan = analyzeThreePhotos({ front: allKps.front, side: allKps.side, back: allKps.back });
        const profile = loadUserProfile();
        determineLevel(scan, {
          activityLevel: profile?.activityLevel ?? 'sedentary',
          hasExistingPain: profile?.hasExistingPain ?? false,
          dailyScreenHours: profile?.dailyScreenHours ?? 6,
        });

        const stableReport = scanReportToPostureReport(scan);
        sessionStorage.setItem('postureReport', JSON.stringify(stableReport));
        sessionStorage.setItem('postureScanV2', JSON.stringify(scan));
        localStorage.setItem('posturefix_scan_report', JSON.stringify(stableReport));
        sessionStorage.setItem('scanCaptures', JSON.stringify(photos));
        try {
          localStorage.setItem('posturefix_scan_v2', JSON.stringify(scan));
          localStorage.setItem('posturefix_scan_captures', JSON.stringify(photos));
        } catch { /* quota */ }

        const sevMap: Record<string, 'low' | 'medium' | 'high'> = {};
        for (const p of scan.problems) sevMap[p.id] = p.riskCategory;

        const savedProfile = saveUserProfile({
          postureLevel: scan.postureLevel,
          detectedProblems: scan.problems.map(p => p.id),
          detectedProblemSeverities: sevMap,
          problemCount: scan.problems.length,
          scanTimestamp: Date.now(),
          exerciseDifficulty: levelToDefaultDifficulty(scan.postureLevel),
        });
        generateAndStoreDailyProgram(savedProfile);

        const scanEntry = buildLocalScanEntry(scan);
        appendLocalScanLog(scanEntry);
        initLevelSystem(scanEntry.riskSummary);

        setScanReport(scan);
        setKps(allKps);
        setPhase('done');
      } catch {
        setErrorMsg('Analysis failed. Please try again.');
        setPhase('error');
      }
    })();
  }, [photos]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-4 pb-4">
        <h1 className="text-[22px] font-bold text-white tracking-tight leading-snug">
          Your{' '}
          <span className="bg-gradient-to-r from-[#ff6b35] to-[#9d4edd] bg-clip-text text-transparent">analysis</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {phase === 'analyzing' && (
          <div className="relative rounded-xl overflow-hidden bg-[#0d0d12] ring-[0.5px] ring-white/[0.04] h-40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-[2px] border-[#9d4edd]/25 border-t-[#9d4edd] rounded-full animate-spin" />
              <span className="text-[11px] text-zinc-500 font-medium">Analyzing your posture...</span>
              <span className="text-[9px] text-zinc-700">This may take a few seconds</span>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="relative rounded-xl overflow-hidden bg-[#0d0d12] ring-[0.5px] ring-red-500/20 p-5 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-red-400 text-lg">!</span>
            </div>
            <p className="text-[12px] text-zinc-400 text-center leading-relaxed">{errorMsg}</p>
            <p className="text-[10px] text-zinc-600 text-center">Go back and retake your photos.</p>
          </div>
        )}

        {phase === 'done' && scanReport && kps && (
          <ScanAnalysisView
            report={scanReport}
            photos={photos}
            keypoints={kps}
            onViewDailyPlan={() => {}}
            onViewFullReport={() => {}}
            onNewScan={() => {}}
            showFullReportButton={false}
            showDailyPlanButton={false}
            showNewScanButton={false}
            riskAnalysisOnly={true}
          />
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
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSlotRef = useRef<'front' | 'side' | 'back'>('front');
  const uploadModeRef = useRef<'camera' | 'library'>('library');

  const togglePart = (id: string) =>
    setSelectedParts((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const setSlotPhoto = useCallback((slot: 'front' | 'side' | 'back', url: string) => {
    if (slot === 'front') setFrontPhoto(url);
    else if (slot === 'side') setSidePhoto(url);
    else setBackPhoto(url);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const slot = uploadSlotRef.current;
    const objectUrl = URL.createObjectURL(file);
    // downscale to 720px wide for performance
    const img = new Image();
    img.src = objectUrl;
    await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); });
    const maxW = 720;
    const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);
    const dataUrl = ctx ? canvas.toDataURL('image/jpeg', 0.88) : objectUrl;
    setSlotPhoto(slot, dataUrl);
  }, [setSlotPhoto]);

  const openCamera = useCallback((slot: 'front' | 'side' | 'back') => {
    uploadSlotRef.current = slot;
    uploadModeRef.current = 'camera';
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  }, []);

  const openUpload = useCallback((slot: 'front' | 'side' | 'back') => {
    uploadSlotRef.current = slot;
    uploadModeRef.current = 'library';
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  }, []);

  const canProceed =
    page === 0 ? selectedParts.length > 0 :
    page === 1 ? equipment !== null :
    page === 2 ? frontPhoto !== null && sidePhoto !== null && backPhoto !== null :
    true;

  const finish = () => {
    saveUserProfile({
      painAreas: selectedParts,
      hasExistingPain: selectedParts.length > 0,
      hasEquipment: equipment === 'band',
      onboardingComplete: true,
    });
    if (onFinish) {
      onFinish();
    } else {
      window.location.href = '/';
    }
  };

  const goNext = () => {
    if (page < 3) setPage(page + 1);
    else finish();
  };
  const goBack = () => page > 0 && setPage(page - 1);

  const c = C[page as keyof typeof C];

  return (
    <div className="w-full h-full bg-[#0a0a0f] flex flex-col" style={{ fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif" }}>
      {/* `display:none` breaks programmatic `.click()` on some iOS Safari versions; keep input in layout but visually hidden */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="sr-only"
        aria-hidden
      />
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
          {page === 2 && <PhotoCapturePage frontPhoto={frontPhoto} sidePhoto={sidePhoto} backPhoto={backPhoto} onCaptureCamera={openCamera} onCaptureUpload={openUpload} />}
          {page === 3 && frontPhoto && sidePhoto && backPhoto && (
            <AnalysisPage photos={{ front: frontPhoto, side: sidePhoto, back: backPhoto }} />
          )}
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
    <div className="w-full max-w-[430px] mx-auto h-full bg-[#0a0a0f] flex flex-col">
      <OnboardingFlow onFinish={() => navigate('/')} />
    </div>
  );
};

export default Onboarding;
