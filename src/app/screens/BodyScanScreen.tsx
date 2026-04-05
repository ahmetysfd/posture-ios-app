import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostureBodyMap from '../components/PostureBodyMap';
import {
  loadMediaPipeScripts,
  createPoseDetector,
  detectPoseFromImage,
  drawSkeleton,
  type PoseModelStatus,
  type MediaPipePose,
} from '../services/PoseDetectionService';
import {
  BODY_REGION_LABELS,
  VIEW_LABELS,
  analyzePostureForView,
  getHighlightedProblems,
  mergePostureReports,
  finalizeAssessment,
  type PostureReport,
  type Landmark,
  type IntendedView,
} from '../services/PostureAnalysisEngine';

const STEPS: { key: IntendedView; title: string; subtitle: string }[] = [
  { key: 'front', title: 'Front', subtitle: 'Face the camera with head to knees visible, arms relaxed slightly away from the body.' },
  { key: 'side', title: 'Side', subtitle: 'Turn 90 degrees so your nose, shoulders, hips, and knees stay in one profile line.' },
  { key: 'back', title: 'Back', subtitle: 'Keep your back to the camera with head to knees visible and body centered on the guide.' },
];

async function downscaleDataUrl(dataUrl: string, maxW = 720): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('img'));
  });
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (w <= maxW) return dataUrl;
  const nw = maxW;
  const nh = Math.round(h * (maxW / w));
  const c = document.createElement('canvas');
  c.width = nw;
  c.height = nh;
  const ctx = c.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, nw, nh);
  return c.toDataURL('image/jpeg', 0.88);
}

const emptyPhotos = (): Record<IntendedView, string | null> => ({
  front: null,
  side: null,
  back: null,
});

function getNativeCaptureFacing(view: IntendedView): 'user' | 'environment' {
  return view === 'front' ? 'user' : 'environment';
}

const BodyScanScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<IntendedView>('front');
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureTimeoutRef = useRef<number | null>(null);

  const [modelStatus, setModelStatus] = useState<PoseModelStatus>('idle');
  const [poseDetector, setPoseDetector] = useState<MediaPipePose | null>(null);
  const [photos, setPhotos] = useState<Record<IntendedView, string | null>>(emptyPhotos);
  const [stepIndex, setStepIndex] = useState(0);
  const [flow, setFlow] = useState<'intro' | 'pick' | 'camera' | 'preview' | 'review3' | 'done'>('intro');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [report, setReport] = useState<PostureReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reeditFromReview, setReeditFromReview] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const [uploadCaptureMode, setUploadCaptureMode] = useState<'user' | 'environment' | undefined>(undefined);

  const currentStep = STEPS[stepIndex];
  const highlightedProblems = report ? getHighlightedProblems(report.problems, 3) : [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setModelStatus('loading');
        await loadMediaPipeScripts();
        const detector = await createPoseDetector();
        if (!cancelled) {
          setPoseDetector(detector);
          setModelStatus('ready');
        }
      } catch (e) {
        if (!cancelled) {
          setModelStatus('error');
          setError('Could not load pose model. Check connection and try again.');
          console.error(e);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach(t => t.stop());
      if (captureTimeoutRef.current) {
        window.clearTimeout(captureTimeoutRef.current);
      }
    };
  }, [cameraStream]);

  const startStepCapture = useCallback(() => {
    setError(null);
    setPreviewUrl(null);
    setFlow('pick');
  }, []);

  const openUpload = useCallback((source: 'library' | 'camera' = 'library') => {
    uploadTargetRef.current = currentStep.key;
    setUploadCaptureMode(source === 'camera' ? getNativeCaptureFacing(currentStep.key) : undefined);
    fileInputRef.current?.click();
  }, [currentStep.key]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose a JPG or PNG.');
      return;
    }
    try {
      const raw = URL.createObjectURL(file);
      const scaled = await downscaleDataUrl(raw, 720);
      URL.revokeObjectURL(raw);
      setPreviewUrl(scaled);
      setFlow('preview');
      setError(null);
    } catch {
      setError('Could not read that image.');
    } finally {
      setUploadCaptureMode(undefined);
    }
  }, []);

  const startCamera = useCallback(async () => {
    const hasLiveCameraApi = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

    if (!hasLiveCameraApi) {
      setError(
        typeof window !== 'undefined' && !window.isSecureContext
          ? 'Live camera needs HTTPS in Safari on iPhone. Opening the native camera instead.'
          : 'Live camera is unavailable here. Opening the native camera instead.',
      );
      openUpload('camera');
      return;
    }

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'user' }, width: { ideal: 720 }, height: { ideal: 960 } },
        }).catch(async (firstError: unknown) => {
          const errorName = firstError instanceof DOMException ? firstError.name : '';
          if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
            throw firstError;
          }

          return navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'user' } },
          }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));
        });

      setCameraStream(stream);
      setFlow('camera');
      setError(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => undefined);
          };
        }
      }, 50);
    } catch (cameraError) {
      const errorName = cameraError instanceof DOMException ? cameraError.name : '';

      if (typeof window !== 'undefined' && !window.isSecureContext) {
        setError('Safari on iPhone only allows live camera on HTTPS pages. Use HTTPS or the native camera fallback.');
        openUpload('camera');
        return;
      }

      if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
        setError('Camera permission was denied in Safari. Allow camera access and try again.');
        return;
      }

      if (errorName === 'NotReadableError' || errorName === 'AbortError') {
        setError('The camera is busy or blocked by another app. Close other camera apps and try again.');
        return;
      }

      if (errorName === 'NotFoundError' || errorName === 'OverconstrainedError') {
        setError('This camera mode is unavailable on your device. Opening the native camera instead.');
        openUpload('camera');
        return;
      }

      setError('Live camera is unavailable here. Use the native camera or upload instead.');
    }
  }, [openUpload]);

  const cancelCamera = useCallback(() => {
    if (captureTimeoutRef.current) {
      window.clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    setCaptureCountdown(null);
    cameraStream?.getTracks().forEach(t => t.stop());
    setCameraStream(null);
    setFlow('pick');
  }, [cameraStream]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (captureCountdown !== null) return;

    setCaptureCountdown(3);

    const scheduleTick = (secondsLeft: number) => {
      captureTimeoutRef.current = window.setTimeout(async () => {
        if (secondsLeft > 1) {
          setCaptureCountdown(secondsLeft - 1);
          scheduleTick(secondsLeft - 1);
          return;
        }

        captureTimeoutRef.current = null;
        setCaptureCountdown(null);

        const activeVideo = videoRef.current;
        if (!activeVideo) return;

        const canvas = document.createElement('canvas');
        canvas.width = activeVideo.videoWidth;
        canvas.height = activeVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(activeVideo, 0, 0);
        const raw = canvas.toDataURL('image/jpeg', 0.92);
        cancelCamera();
        try {
          const scaled = await downscaleDataUrl(raw, 720);
          setPreviewUrl(scaled);
          setFlow('preview');
        } catch {
          setPreviewUrl(raw);
          setFlow('preview');
        }
      }, 1000);
    };

    scheduleTick(3);
  }, [cancelCamera, captureCountdown]);

  const confirmPreview = useCallback(() => {
    if (!previewUrl) return;
    const key = currentStep.key;
    setPhotos(p => ({ ...p, [key]: previewUrl }));
    setPreviewUrl(null);
    if (reeditFromReview) {
      setReeditFromReview(false);
      setFlow('review3');
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(i => i + 1);
      setFlow('pick');
    } else {
      setFlow('review3');
    }
  }, [previewUrl, currentStep.key, stepIndex, reeditFromReview]);

  const retakePreview = useCallback(() => {
    setPreviewUrl(null);
    setFlow('pick');
  }, []);

  const redrawSkeleton = useCallback((landmarks: Landmark[]) => {
    requestAnimationFrame(() => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (!img || !canvas || !landmarks.length) return;
      const w = img.clientWidth;
      const h = img.clientHeight;
      if (w < 2 || h < 2) return;
      drawSkeleton(canvas, landmarks, w, h);
    });
  }, []);

  const runAnalysisAll = useCallback(async () => {
    if (!poseDetector) return;
    const keys: IntendedView[] = ['front', 'side', 'back'];
    if (keys.some(k => !photos[k])) {
      setError('Need all three photos first.');
      return;
    }
    setAnalyzing(true);
    setError(null);
    setReport(null);
    try {
      const partial: { view: IntendedView; report: PostureReport }[] = [];
      for (const view of keys) {
        const url = photos[view]!;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('img'));
        });
        const result = await detectPoseFromImage(poseDetector, img);
        if (!result) {
          setError(`No pose detected in ${view} photo. Stand farther back, improve light, match the silhouette guide, and retake.`);
          setAnalyzing(false);
          return;
        }
        partial.push({ view, report: analyzePostureForView(result.landmarks, view) });
      }
      const merged = mergePostureReports(partial);
      const { report: stableReport } = finalizeAssessment(merged);
      setReport(stableReport);
      sessionStorage.setItem('postureReport', JSON.stringify(stableReport));
      sessionStorage.setItem('scanCaptures', JSON.stringify({ front: photos.front, side: photos.side, back: photos.back }));
      sessionStorage.setItem('scanImageUrl', photos.side || photos.front || photos.back || '');
      setPreviewUrl(photos.side || photos.front || photos.back || null);
      setFlow('done');
    } catch (e) {
      console.error(e);
      setError('Analysis failed. Try again.');
    }
    setAnalyzing(false);
  }, [poseDetector, photos]);

  const resetAll = useCallback(() => {
    if (captureTimeoutRef.current) {
      window.clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    setCaptureCountdown(null);
    setPhotos(emptyPhotos());
    setStepIndex(0);
    setPreviewUrl(null);
    setReport(null);
    setFlow('intro');
    setError(null);
  }, []);

  return (
    <div style={{
      width: '100%',
      maxWidth: 430,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--color-bg)',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '52px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>Body scan</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-tert)', marginTop: 2 }}>
            {flow === 'intro' ? '3 angles for sharper results' : `Step ${Math.min(stepIndex + 1, 3)} of 3 · ${currentStep.title}`}
          </p>
        </div>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: modelStatus === 'ready' ? 'var(--color-accent)' : modelStatus === 'loading' ? 'var(--color-warning)' : 'var(--color-danger)',
        }} />
      </div>

      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8 }}>
        {STEPS.map((step, index) => {
          const active = index === stepIndex && flow !== 'intro';
          const completed = !!photos[step.key];
          return (
            <div
              key={step.key}
              style={{
                flex: 1,
                borderRadius: 14,
                padding: '10px 12px',
                background: active ? 'rgba(124,211,255,0.12)' : 'var(--color-surface)',
                border: completed
                  ? '1px solid rgba(52,211,153,0.35)'
                  : active
                    ? '1px solid rgba(124,211,255,0.35)'
                    : '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: active ? '#7DD3FC' : 'var(--color-text)' }}>{step.title}</div>
              <div style={{ fontSize: 10, color: completed ? 'var(--color-accent)' : 'var(--color-text-tert)', marginTop: 3 }}>
                {completed ? 'Captured' : active ? 'Current' : 'Pending'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={uploadCaptureMode}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {flow === 'intro' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 18,
              padding: 18,
              border: '1px solid var(--color-border)',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 10 }}>3 guided posture photos</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5, marginBottom: 12 }}>
                We combine <strong>front</strong>, <strong>side</strong>, and <strong>back</strong> scans to place findings on stable body regions.
                Match the body guide, keep your full body visible, and stand in a natural posture.
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--color-text-sec)', fontSize: 13, lineHeight: 1.55 }}>
                <li>Plain wall, even light</li>
                <li>Step back until your head and knees stay inside the frame</li>
                <li>Use fitted clothing when possible for cleaner landmark detection</li>
                <li>Educational only — not medical advice</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => { setFlow('pick'); setStepIndex(0); }}
              disabled={modelStatus !== 'ready'}
              style={{
                width: '100%', padding: 16, borderRadius: 18,
                background: modelStatus === 'ready' ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: modelStatus === 'ready' ? '#fff' : 'var(--color-text-tert)',
                fontSize: 16, fontWeight: 700, border: 'none',
                cursor: modelStatus === 'ready' ? 'pointer' : 'not-allowed',
                boxShadow: modelStatus === 'ready' ? 'var(--shadow-button)' : 'none',
              }}
            >
              Start 3-photo scan
            </button>
          </div>
        )}

        {flow === 'pick' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 18,
              padding: 16,
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 6 }}>{currentStep.title} view</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>{currentStep.subtitle}</p>
            </div>
            <div style={{
              borderRadius: 22,
              padding: 12,
              background: 'linear-gradient(180deg, rgba(124,211,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid rgba(124,211,255,0.18)',
            }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.6 }}>
                Take one clear {currentStep.title.toLowerCase()} photo against a plain wall with your head and knees visible.
              </div>
            </div>
            <button
              type="button"
              onClick={startCamera}
              disabled={modelStatus !== 'ready'}
              style={{
                width: '100%', padding: 16, borderRadius: 18,
                background: modelStatus === 'ready' ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                color: modelStatus === 'ready' ? '#fff' : 'var(--color-text-tert)',
                fontSize: 16, fontWeight: 700, border: 'none',
                cursor: modelStatus === 'ready' ? 'pointer' : 'not-allowed',
                boxShadow: modelStatus === 'ready' ? 'var(--shadow-button)' : 'none',
              }}
            >
              Take photo
            </button>
            <button
              type="button"
              onClick={() => openUpload('library')}
              disabled={modelStatus !== 'ready'}
              style={{
                width: '100%', padding: 16, borderRadius: 18,
                background: 'var(--color-surface)',
                color: modelStatus === 'ready' ? 'var(--color-text)' : 'var(--color-text-tert)',
                fontSize: 15, fontWeight: 600,
                border: '1px solid var(--color-border)',
                cursor: modelStatus === 'ready' ? 'pointer' : 'not-allowed',
              }}
            >
              Upload photo
            </button>
          </div>
        )}

        {flow === 'camera' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              borderRadius: 24,
              overflow: 'hidden',
              background: 'linear-gradient(180deg, rgba(8,12,18,0.98), rgba(11,15,19,0.92))',
              position: 'relative',
              aspectRatio: '3/4',
              border: '1px solid rgba(124,211,255,0.22)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
            }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {captureCountdown !== null && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(8,12,18,0.36)',
                  backdropFilter: 'blur(2px)',
                }}>
                  <div style={{
                    width: 86,
                    height: 86,
                    borderRadius: '50%',
                    background: 'rgba(8,12,18,0.78)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 38,
                    fontWeight: 800,
                  }}>
                    {captureCountdown}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.86)', fontWeight: 600 }}>
                    Hold still
                  </div>
                </div>
              )}
              <div style={{
                position: 'absolute',
                left: 12,
                right: 12,
                top: 12,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                pointerEvents: 'none',
              }}>
                <div style={{
                  padding: '7px 10px',
                  borderRadius: 999,
                  background: 'rgba(8,12,18,0.72)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#E5EEF6',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {currentStep.title} capture
                </div>
                <div style={{
                  padding: '7px 10px',
                  borderRadius: 999,
                  background: 'rgba(8,12,18,0.72)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#BAE6FD',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  Head to knees
                </div>
              </div>
            </div>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 16,
              padding: 14,
              border: '1px solid var(--color-border)',
            }}>
              <p style={{ fontSize: 12, color: 'var(--color-text-sec)', lineHeight: 1.5 }}>
                {captureCountdown !== null
                  ? `Capturing in ${captureCountdown}… keep your position steady.`
                  : currentStep.subtitle}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={cancelCamera} style={{
                flex: 1, padding: 14, borderRadius: 16,
                background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600,
                border: '1px solid var(--color-border)', cursor: 'pointer',
              }}>{captureCountdown !== null ? 'Stop' : 'Cancel'}</button>
              <button type="button" onClick={capturePhoto} disabled={captureCountdown !== null} style={{
                flex: 2, padding: 14, borderRadius: 16,
                background: captureCountdown !== null ? 'var(--color-surface-elevated)' : 'var(--color-primary)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                border: 'none', cursor: captureCountdown !== null ? 'not-allowed' : 'pointer',
                boxShadow: captureCountdown !== null ? 'none' : 'var(--shadow-button)',
              }}>{captureCountdown !== null ? 'Capturing…' : 'Capture'}</button>
            </div>
          </div>
        )}

        {flow === 'preview' && previewUrl && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-tert)' }}>Confirm your {currentStep.title.toLowerCase()} framing or retake if head/knees are cropped.</p>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000' }}>
              <img src={previewUrl} alt="" style={{ width: '100%', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={retakePreview} style={{
                flex: 1, padding: 14, borderRadius: 16,
                background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14, fontWeight: 600,
                border: '1px solid var(--color-border)', cursor: 'pointer',
              }}>Retake</button>
              <button type="button" onClick={confirmPreview} style={{
                flex: 2, padding: 14, borderRadius: 16,
                background: 'var(--color-primary)', color: '#fff', fontSize: 15, fontWeight: 700,
                border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-button)',
              }}>Use photo</button>
            </div>
          </div>
        )}

        {flow === 'review3' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>All set — review all three angles</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.5 }}>
              Retake any cropped or off-center view before you run the posture screen.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    setStepIndex(i);
                    setPreviewUrl(photos[s.key]);
                    setReeditFromReview(true);
                    setFlow('preview');
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: stepIndex === i ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    padding: 0,
                    cursor: 'pointer',
                    background: '#000',
                  }}
                >
                  {photos[s.key] && (
                    <img src={photos[s.key]!} alt="" style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ fontSize: 10, padding: 4, color: 'var(--color-text-sec)', background: 'var(--color-surface)' }}>{s.title}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={runAnalysisAll}
              disabled={analyzing || modelStatus !== 'ready'}
              style={{
                width: '100%', padding: 16, borderRadius: 18,
                background: analyzing ? 'var(--color-surface-elevated)' : 'var(--color-primary)',
                color: analyzing ? 'var(--color-text-tert)' : '#fff',
                fontSize: 16, fontWeight: 700, border: 'none',
                cursor: analyzing || modelStatus !== 'ready' ? 'not-allowed' : 'pointer',
                boxShadow: analyzing ? 'none' : 'var(--shadow-button)',
              }}
            >
              {analyzing ? 'Analyzing 3 photos…' : 'Analyze all 3'}
            </button>
            <button type="button" onClick={resetAll} style={{
              width: '100%', padding: 12, borderRadius: 16,
              background: 'var(--color-surface)', color: 'var(--color-text-sec)',
              fontSize: 13, border: '1px solid var(--color-border)', cursor: 'pointer',
            }}>Start over</button>
          </div>
        )}

        {flow === 'done' && (previewUrl || photos.front) && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-tert)' }}>Preview: side view (or front if no side)</p>
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#000' }}>
              <img ref={imageRef} src={previewUrl || photos.front || ''} alt="" style={{ width: '100%', display: 'block' }} />
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              />
            </div>

            {report && (
              <>
                <div style={{
                  background: 'var(--color-surface)',
                  borderRadius: 18,
                  padding: 16,
                  border: '1px solid var(--color-border)',
                }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tert)', marginBottom: 8 }}>
                    Combined views: {report.viewsCombined?.map(view => VIEW_LABELS[view]).join(' + ') || 'Multi-view'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>Overall posture score</span>
                    <span style={{
                      fontWeight: 800,
                      color: report.overallScore >= 70 ? 'var(--color-accent)' : report.overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)',
                    }}>{report.overallScore}/100</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tert)', lineHeight: 1.5 }}>
                    Scores are stabilized into bands so similar poses read the same across retakes. Open the full report for your level and exercises.
                  </p>
                </div>

                <PostureBodyMap findings={report.problems} compact maxFindings={3} />

                {highlightedProblems.length > 0 && (
                  <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 18,
                    padding: 16,
                    border: '1px solid var(--color-border)',
                  }}>
                    {highlightedProblems.map(problem => (
                      <div key={problem.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                            {problem.mapLabel ?? BODY_REGION_LABELS[problem.bodyRegion]}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-tert)', marginTop: 3 }}>
                            {problem.confidenceLabel}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>
                          {problem.score >= 20
                            ? `${problem.severity.charAt(0).toUpperCase()}${problem.severity.slice(1)}`
                            : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => navigate('/progress')}
              style={{
                width: '100%', padding: 16, borderRadius: 18,
                background: 'var(--color-primary)', color: '#fff', fontSize: 16, fontWeight: 700,
                border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-button)',
              }}
            >
              View progress →
            </button>
            <button type="button" onClick={resetAll} style={{
              padding: 12, borderRadius: 16,
              background: 'var(--color-surface)', color: 'var(--color-text)',
              fontSize: 14, border: '1px solid var(--color-border)', cursor: 'pointer',
            }}>New scan</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyScanScreen;
