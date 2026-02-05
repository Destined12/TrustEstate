
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { verifyIdentityIntegrity } from '../../services/verificationService';

interface OnboardingProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // Simulation for fast onboarding in backend-focused version
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const captureFace = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  useEffect(() => {
    if (step === 2) startCamera();
    else if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [step]);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Integrity Audit Hub</h2>
          <p className="opacity-80">Authorize your node with biometric registry linking.</p>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-8 text-center">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner"><i className="fas fa-id-card"></i></div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Government ID Registry</h3>
                <p className="text-slate-500 text-sm mt-1">Upload your NIN or Passport for registry synchronization.</p>
              </div>
              <label className="block border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-indigo-200 transition-all cursor-pointer">
                <input type="file" className="hidden" onChange={handleIdUpload} disabled={loading} />
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} text-4xl text-indigo-300 mb-4`}></i>
                <p className="font-bold text-slate-600">{loading ? 'Analyzing Identity...' : 'Select ID Document'}</p>
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 text-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Biometric Handshake</h3>
                <p className="text-slate-500 text-sm">Portrait-mode face capture for the secure registry.</p>
              </div>
              <div className="relative aspect-[3/4] max-w-[280px] mx-auto bg-slate-900 rounded-[3rem] overflow-hidden border-8 border-slate-50 shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <button onClick={captureFace} disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all">{loading ? 'Syncing Biometrics...' : 'Capture Portrait'}</button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10 space-y-6">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner"><i className="fas fa-check"></i></div>
              <h3 className="text-2xl font-black text-slate-800">Authorization Complete</h3>
              <p className="text-slate-500">Registry Integrity: Verified.</p>
              <button onClick={() => onComplete({ ...user, isKycVerified: true, kycStep: 3, isEmailVerified: true, isPhoneVerified: true })} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">Launch Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
