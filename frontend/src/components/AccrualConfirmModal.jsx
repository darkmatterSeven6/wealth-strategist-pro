import React from 'react';

export const AccrualConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-sm pt-[15vh] px-4 pb-12">
      <div className="mx-auto w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 relative">
        
        <div className="flex items-center gap-2.5 text-amber-400 mb-4">
          <span className="text-xl">⚠️</span>
          <h3 className="text-base font-bold leading-tight">Confirm Manual Daily Accrual Trigger</h3>
        </div>
        
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          You are about to manually execute a 1-day interest accrual pass across your household portfolio. 
          This will advance daily yield calculations and update both liquid cash and virtual goal balances ahead of tonight's automated 12:00 AM script.
        </p>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 mb-5">
          <p className="text-xs text-amber-300 font-medium leading-relaxed">
            🛑 <strong>WARNING:</strong> Do NOT trigger this if your dashboard is already aligned with today's ground truth balance. Executing out of sequence will result in double-compounding when the midnight cron process runs.
          </p>
        </div>

        <p className="text-xs text-slate-300 font-semibold mb-6">
          Are you sure you want to advance portfolio ledgers by +1 Day?
        </p>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-600/20"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Confirm & Advance Accrual (+1 Day)'}
          </button>
        </div>

      </div>
    </div>
  );
};
