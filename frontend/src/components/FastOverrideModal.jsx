import React, { useState } from 'react';
import { Sliders, CheckCircle2, Wallet } from 'lucide-react';

export default function FastOverrideModal({ accounts, isOpen, onClose, onSaveOverride }) {
  const [selectedAccId, setSelectedAccId] = useState(accounts[0]?.id || '');
  const selectedAcc = accounts.find(a => a.id === selectedAccId) || accounts[0];

  const [name, setName] = useState(selectedAcc?.name || '');
  const [institution, setInstitution] = useState(selectedAcc?.institution || '');
  const [accountNumber, setAccountNumber] = useState(selectedAcc?.accountNumber || '');
  const [balance, setBalance] = useState(selectedAcc?.balance?.toString() || '');
  const [apy, setApy] = useState(selectedAcc?.currentApy?.toString() || '');
  const [tierInfo, setTierInfo] = useState(selectedAcc?.tierInfo || '');

  const handleSelectAccount = (id) => {
    setSelectedAccId(id);
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      setName(acc.name || '');
      setInstitution(acc.institution || '');
      setAccountNumber(acc.accountNumber || '');
      setBalance(acc.balance.toString());
      setApy(acc.currentApy.toString());
      setTierInfo(acc.tierInfo || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccId) return;
    onSaveOverride({
      accountId: selectedAccId,
      name,
      institution,
      accountNumber,
      balance: parseFloat(balance),
      currentApy: parseFloat(apy),
      tierInfo
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Quick Adjust & Account Override</h3>
              <p className="text-xs text-slate-400">Modify balances, rates, display names, and masking formats.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select Account to Adjust
            </label>
            <select
              value={selectedAccId}
              onChange={(e) => handleSelectAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.institution}) — ₱{a.balance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Maya Savings"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Institution / Provider
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Maya Bank"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Account / Mobile Number (Masking Format)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              placeholder="e.g. •••• 3912 or 0917 •••• 981"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                New Balance (₱ PHP)
              </label>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Interest APY (% p.a.)
              </label>
              <input
                type="number"
                step="0.01"
                value={apy}
                onChange={(e) => setApy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Active Tier / Promotion Note
            </label>
            <input
              type="text"
              value={tierInfo}
              onChange={(e) => setTierInfo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
              placeholder="e.g. 10% boosted tier on Maya missions"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-cyan"
            >
              Apply Fast Override
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
