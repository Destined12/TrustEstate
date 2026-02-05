
import React, { useState } from 'react';
import { Property, FraudSignal, PropertyStatus } from '../../types';
import { analyzeFraudLog } from '../../services/geminiService';

interface FraudDeskProps {
  properties: Property[];
  onLock: (id: string) => void;
  onUnlock: (id: string) => void;
}

const FraudDesk: React.FC<FraudDeskProps> = ({ properties, onLock, onUnlock }) => {
  const flaggedProperties = properties.filter(p => p.fraudScore > 20 || p.signals.length > 0);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const handleAiAnalyze = async (prop: Property) => {
    setAnalyzingId(prop.id);
    setAiReport(null);
    try {
      // Added prop.address as the second argument required by analyzeFraudLog
      const report = await analyzeFraudLog(prop.signals, prop.address);
      // Extract the text property from the returned object to match the state type
      setAiReport(report.text);
    } catch (e) {
      setAiReport("Error communicating with AI services.");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fraud Intelligence Center</h2>
          <p className="text-slate-500">ML-driven risk scoring and signal tracking</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl border border-red-100 flex items-center space-x-2">
            <span className="text-xl font-bold">{flaggedProperties.filter(p => p.fraudScore > 70).length}</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Risks</span>
          </div>
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 flex items-center space-x-2">
            <span className="text-xl font-bold">{flaggedProperties.length}</span>
            <span className="text-xs font-semibold uppercase tracking-wider">Total Flags</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {flaggedProperties.map(prop => (
          <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-slate-50 p-6 border-r border-slate-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl ${prop.fraudScore > 70 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {prop.fraudScore}%
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{prop.title}</h4>
                  <p className="text-xs text-slate-500">{prop.upc}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Doc Integrity Hash</span>
                  <code className="text-[10px] break-all text-indigo-600 font-mono">
                    {prop.documentHash || 'NO_DOCUMENT_UPLOADED'}
                  </code>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAiAnalyze(prop)}
                    disabled={analyzingId === prop.id}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {analyzingId === prop.id ? 'Analyzing...' : 'AI Risk Audit'}
                  </button>
                  {prop.status === PropertyStatus.LOCKED ? (
                    <button 
                      onClick={() => onUnlock(prop.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Unlock
                    </button>
                  ) : (
                    <button 
                      onClick={() => onLock(prop.id)}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Lock Property
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 p-6">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Signals Detected</h5>
              <div className="space-y-3">
                {prop.signals.length > 0 ? (
                  prop.signals.map(sig => (
                    <div key={sig.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className={`mt-1 h-2 w-2 rounded-full ${sig.severity === 'High' ? 'bg-red-500' : sig.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold text-slate-800">{sig.type} Signal</span>
                          <span className="text-[10px] text-slate-400">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-600">{sig.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific signals logged, score based on general heuristic patterns.</p>
                )}
              </div>

              {aiReport && analyzingId === null && (
                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-robot text-indigo-600"></i>
                    <span className="text-xs font-bold text-indigo-900 uppercase">AI Analyst Findings</span>
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed whitespace-pre-wrap">{aiReport}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {flaggedProperties.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <i className="fas fa-check-circle text-emerald-500 text-5xl mb-4"></i>
            <h3 className="text-xl font-bold text-slate-800">No Security Threats Detected</h3>
            <p className="text-slate-500">All properties are currently below the critical risk threshold.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDesk;
