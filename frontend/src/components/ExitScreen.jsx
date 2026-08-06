import React from 'react';
import { ShieldCheck, RotateCcw, GitBranch, Database, Check } from 'lucide-react';

export default function ExitScreen({ onResume, savedToGitHub, lastSavedTime }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl shadow-emerald-950/20 text-center space-y-6 animate-fadeIn">
        
        {/* Glowing Status Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">
            Session Safely Closed
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {savedToGitHub ? (
              <>Your latest balances, assets, liabilities, and settings have been successfully synced to your local database and GitHub repository.</>
            ) : (
              <>DV Financials session closed. You can safely close this browser tab.</>
            )}
          </p>
        </div>

        {/* Sync Summary Details */}
        {savedToGitHub && (
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5 text-xs text-left">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Local DB (<code className="text-cyan-300 text-[11px]">db.json</code>)</span>
              </span>
              <span className="flex items-center text-emerald-400 font-bold space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Flushed & Saved</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                <span>GitHub (<code className="text-emerald-300 text-[11px]">origin/main</code>)</span>
              </span>
              <span className="flex items-center text-emerald-400 font-bold space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Pushed</span>
              </span>
            </div>

            {lastSavedTime && (
              <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
                Timestamp: <span className="font-mono text-slate-300">{lastSavedTime}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 space-y-3">
          <p className="text-xs text-slate-400">
            You can now close this tab or reopen the app below:
          </p>
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resume DV Financials Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
