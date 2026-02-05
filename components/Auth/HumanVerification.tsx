
import React, { useState, useEffect } from 'react';

interface HumanVerificationProps {
  onVerified: (verified: boolean) => void;
}

const HumanVerification: React.FC<HumanVerificationProps> = ({ onVerified }) => {
  const [math, setMath] = useState({ n1: 0, n2: 0, sum: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setMath({ n1, n2, sum: n1 + n2 });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);
    if (parseInt(val) === math.sum) {
      setIsVerified(true);
      onVerified(true);
    } else {
      setIsVerified(false);
      onVerified(false);
    }
  };

  return (
    <div className="space-y-4 py-6 px-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Human Verification</span>
        {isVerified && (
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
            <i className="fas fa-check-circle mr-2"></i> Verified
          </span>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-600 block">
          Quick Math: What is {math.n1} + {math.n2}?
        </label>
        <div className="relative">
          <input 
            type="number" 
            className={`w-full px-6 py-4 rounded-2xl border-2 transition-all font-black text-xl outline-none ${isVerified ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white focus:border-indigo-500'}`}
            placeholder="?"
            value={userAnswer}
            onChange={handleInputChange}
            disabled={isVerified}
          />
          {isVerified && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-xl">
              <i className="fas fa-shield-check"></i>
            </div>
          )}
        </div>
        {!isVerified && userAnswer !== '' && parseInt(userAnswer) !== math.sum && (
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-1">Incorrect result. Try again.</p>
        )}
      </div>
    </div>
  );
};

export default HumanVerification;
