
import React, { useState, useEffect } from 'react';

const ConfigPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [config, setConfig] = useState({
    neonDbUrl: '',
    authDomain: '',
    authClientId: '',
    recaptchaSiteKey: '',
    encryptionSecret: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('trustestate_app_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('trustestate_app_config', JSON.stringify(config));
    alert("Configuration saved successfully. System parameters updated.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-10 py-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Infrastructure Settings</h2>
            <p className="text-slate-400 text-sm mt-1">Configure Database, Authentication & Security</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-full transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-10 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Neon Database Configuration</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Neon DB Connection String</label>
              <input 
                type="password" 
                placeholder="postgresql://user:password@ep-cool-name-123.us-east-2.aws.neon.tech/neondb"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs"
                value={config.neonDbUrl}
                onChange={e => setConfig({...config, neonDbUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Auth & Security</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Auth Domain</label>
                <input 
                  type="text" 
                  placeholder="auth.trustestate.ng"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                  value={config.authDomain}
                  onChange={e => setConfig({...config, authDomain: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Auth Client ID</label>
                <input 
                  type="text" 
                  placeholder="ID-8829-X"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                  value={config.authClientId}
                  onChange={e => setConfig({...config, authClientId: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Google ReCAPTCHA Site Key</label>
              <input 
                type="text" 
                placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                value={config.recaptchaSiteKey}
                onChange={e => setConfig({...config, recaptchaSiteKey: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 flex space-x-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all"
            >
              Initialize Backend Parameters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigPage;
