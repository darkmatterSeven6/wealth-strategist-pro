import React from 'react';
import { AlertTriangle, Save, LogOut, X, GitCommit, Database, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ExitConfirmationModal({
  isOpen,
  onClose,
  onSaveAndExit,
  onExitWithoutSaving,
  isSaving,
  hasUnsavedChanges = true,
  lastSavedTime = null
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-emerald-950/30 overflow-hidden text-slate-100">
        {/* Top Accent Line */}
        <div className={`h-1.5 w-full ${hasUnsavedChanges ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${hasUnsavedChanges ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
              {hasUnsavedChanges ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {hasUnsavedChanges ? 'Unsaved Changes Warning' : 'Exit DV Financials Session'}
              </h3>
              <p className="text-xs text-slate-400">
                Confirm session termination & cloud sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Main User Notification Prompt */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {hasUnsavedChanges ? (
                <>
                  <span className="font-bold text-amber-400">Current Data and settings have not been saved.</span>
                  <br />
                  Would you like to <span className="text-emerald-400 font-semibold">Save & Sync to GitHub</span> now before exiting?
                </>
              ) : (
                <>
                  All your data is currently up-to-date locally and on GitHub.
                  <br />
                  Are you ready to close this session?
                </>
              )}
            </p>
          </div>

          {/* Sync Targets Breakdown */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start space-x-2.5">
              <Database className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">Local Database</span>
                <span className="text-slate-400 text-[11px]">
                  Flushes state to <code className="text-cyan-300">db.json</code>
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-start space-x-2.5">
              <GitCommit className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">GitHub Sync</span>
                <span className="text-slate-400 text-[11px]">
                  Pushes commit to <code className="text-emerald-300">origin/main</code>
                </span>
              </div>
            </div>
          </div>

          {lastSavedTime && (
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-1">
              <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Last synced: {lastSavedTime}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-950/70 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition disabled:opacity-50 order-3 sm:order-1"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onExitWithoutSaving}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/60 transition disabled:opacity-50 order-2"
          >
            <span className="flex items-center justify-center space-x-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Without Saving</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onSaveAndExit}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-3"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving & Pushing...' : 'Save & Exit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
