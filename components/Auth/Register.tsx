
import React, { useState, useRef } from 'react';
import { UserRole, UserProfile } from '../../types';
import { Button } from '../ui/button';

interface RegisterProps {
  onRegister: (user: UserProfile) => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.TENANT
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setProfileImage(dataUrl);
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileImage) {
      alert("Biometric photo capture is required for registry enrollment.");
      return;
    }
    const newUser: UserProfile = {
      id: 'user-' + Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isKycVerified: false,
      kycStep: 0,
      profileImage: profileImage
    };
    onRegister(newUser);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-6 py-12">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-indigo-200">
            <i className="fas fa-fingerprint"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registry Enrollment</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Initialize your biometric profile node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Photo Capture */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Portrait (Liveness Check)</label>
            <div className="relative aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
              ) : isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <button type="button" onClick={startCamera} className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <i className="fas fa-camera text-3xl"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Initialize Lens</span>
                </button>
              )}
              
              {isCameraActive && (
                <button 
                  type="button" 
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-slate-900 w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <i className="fas fa-circle text-2xl text-indigo-600"></i>
                </button>
              )}

              {profileImage && !isCameraActive && (
                <button 
                  type="button" 
                  onClick={startCamera}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md"
                >
                  Retake
                </button>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
            <input 
              required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Node Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
              placeholder="email@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Role</label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-sm"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value={UserRole.TENANT}>Tenant / Buyer Node</option>
              <option value={UserRole.LANDLORD}>Landlord / Owner Node</option>
            </select>
          </div>
          <Button type="submit" className="w-full py-5 text-lg uppercase tracking-[0.2em] mt-4 shadow-xl">Enroll Identity Node</Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already registered? <button onClick={onSwitchToLogin} className="text-indigo-600 font-bold hover:underline">Access Session</button>
          </p>
        </div>
      </div>
    </div>
  );
}
