import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  DollarSign,
  ArrowRight,
  Shield,
  GripVertical
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function AccountAggregator({ 
  accounts, 
  onOverrideAccount, 
  onCreateAccount,
  onReorderAccounts
}) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [newApy, setNewApy] = useState('');
  const [newTierInfo, setNewTierInfo] = useState('');

  // Add Account State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addInstitution, setAddInstitution] = useState('');
  const [addBalance, setAddBalance] = useState('');
  const [addApy, setAddApy] = useState('3.5');

  const totalLiquid = accounts
    .filter(a => a.isLiquid)
    .reduce((sum, a) => sum + a.balance, 0);

  const totalDailyInterest = accounts.reduce((sum, a) => sum + (a.dailyInterestEstimate || 0), 0);
  const totalAnnualInterest = totalDailyInterest * 365;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const items = Array.from(accounts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (onReorderAccounts) {
      onReorderAccounts(items);
    }
  };

  const handleOpenOverride = (acc) => {
    setSelectedAccount(acc);
    setNewBalance(acc.balance.toString());
    setNewApy(acc.currentApy.toString());
    setNewTierInfo(acc.tierInfo || '');
    setIsOverrideOpen(true);
  };

  const handleSaveOverride = (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    onOverrideAccount({
      accountId: selectedAccount.id,
      balance: parseFloat(newBalance),
      currentApy: parseFloat(newApy),
      tierInfo: newTierInfo
    });
    setIsOverrideOpen(false);
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    onCreateAccount({
      name: addName,
      institution: addInstitution,
      balance: parseFloat(addBalance),
      currentApy: parseFloat(addApy)
    });
    setIsAddOpen(false);
    setAddName('');
    setAddInstitution('');
    setAddBalance('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Aggregate Yield Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Digital Banks & Liquid Wallets
          </h2>
          <p className="text-sm text-slate-400">
            Real-time balance aggregation, daily APY accrual, and high-yield tier tracking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 font-medium">
            <GripVertical className="w-3.5 h-3.5 text-emerald-400" />
            <span>Drag cards to reorder</span>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Yield Accrual KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Liquid Cash</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            ₱{totalLiquid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">
            Instant liquidity available across 5+ digital banks
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Daily Interest Accrued</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            +₱{totalDailyInterest.toFixed(2)}<span className="text-xs text-slate-400 font-normal"> / day</span>
          </div>
          <span className="text-[11px] text-emerald-300 font-semibold mt-1 block">
            Compounding automatically every 24 hours
          </span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Annual Projected Yield</span>
          <div className="text-2xl font-extrabold text-purple-300 font-mono mt-1">
            +₱{totalAnnualInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}<span className="text-xs text-slate-400 font-normal"> / yr</span>
          </div>
          <span className="text-[11px] text-purple-400 font-semibold mt-1 block">
            Zero-risk passive income from digital bank APY
          </span>
        </div>
      </div>

      {/* Account Cards Grid with Drag-and-Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="accounts-droppable-grid" direction="horizontal">
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {accounts.map((acc, index) => {
                const isBoosted = acc.currentApy >= 6.0;
                return (
                  <Draggable key={acc.id} draggableId={acc.id} index={index}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-5 rounded-2xl glass-panel-interactive border relative flex flex-col justify-between group transition-all duration-200 ${
                          snapshot.isDragging 
                            ? 'border-emerald-500/80 shadow-2xl shadow-emerald-950/80 bg-slate-900 ring-2 ring-emerald-500/50 z-50 scale-[1.02]' 
                            : 'border-slate-800/80'
                        }`}
                      >
                        <div>
                          {/* Card Top Row */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              {/* Drag Handle */}
                              <div 
                                {...provided.dragHandleProps}
                                className="p-1 -ml-1 text-slate-500 hover:text-emerald-400 cursor-grab active:cursor-grabbing rounded transition"
                                title="Drag to reorder account"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md shrink-0"
                                style={{ backgroundColor: acc.color || '#3b82f6' }}
                              >
                                <Wallet className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-100 text-sm">{acc.name}</h4>
                                <p className="text-xs text-slate-400">{acc.institution} • {acc.accountNumber}</p>
                              </div>
                            </div>

                            {/* APY Badge */}
                            <div className="shrink-0 ml-2">
                              <div className={`shrink-0 whitespace-nowrap h-auto py-1 px-3 border text-xs font-semibold tracking-wide rounded-full flex items-center justify-center shadow-sm ${
                                isBoosted 
                                  ? 'bg-amber-950/60 border-amber-800/40 text-amber-400 animate-pulse' 
                                  : 'bg-emerald-950/60 border-emerald-800/40 text-emerald-400'
                              }`}>
                                {acc.currentApy}% p.a.
                              </div>
                            </div>
                          </div>

                          {/* Balance Display */}
                          <div className="mt-4 pt-3 border-t border-slate-800/60">
                            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Current Balance</span>
                            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-0.5">
                              ₱{acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          {/* Tier Info & Sub-Accounts */}
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-[11px] text-slate-400">Interest Tier</span>
                              <span className="font-semibold text-emerald-400">{acc.tierInfo}</span>
                            </div>
                            {acc.dailyInterestEstimate > 0 && (
                              <div className="flex items-center justify-between text-slate-300 mt-1">
                                <span className="text-[11px] text-slate-400">Est. Daily Gain</span>
                                <span className="font-mono font-bold text-white">+₱{acc.dailyInterestEstimate.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Sub Accounts / Stashes if any */}
                          {acc.subAccounts && acc.subAccounts.length > 0 && (
                            <div className="mt-2.5 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Pockets & Stashes</span>
                              {acc.subAccounts.map((stash, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px] px-2 py-1 bg-slate-900/40 rounded-lg">
                                  <span className="text-slate-300">{stash.name}</span>
                                  <span className="font-mono text-slate-200">₱{stash.balance.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Synced {acc.lastSynced ? new Date(acc.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                          </div>

                          <button
                            onClick={() => handleOpenOverride(acc)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition flex items-center space-x-1"
                          >
                            <Sliders className="w-3 h-3 text-cyan-400" />
                            <span>Override</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Manual Override Modal */}
      {isOverrideOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Quick Adjust: {selectedAccount.name}</h3>
              <button onClick={() => setIsOverrideOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Balance (₱ PHP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Current APY (% p.a.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newApy}
                  onChange={(e) => setNewApy(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tier / Mission Status
                </label>
                <input
                  type="text"
                  value={newTierInfo}
                  onChange={(e) => setNewTierInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Boosted 10% on first 100k"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-emerald"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Account Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Digital Bank or Wallet</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. SeaBank High Yield"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Institution / Provider
                </label>
                <input
                  type="text"
                  value={addInstitution}
                  onChange={(e) => setAddInstitution(e.target.value)}
                  placeholder="e.g. SeaBank Philippines"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Balance (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={addBalance}
                    onChange={(e) => setAddBalance(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    APY (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={addApy}
                    onChange={(e) => setAddApy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-emerald"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
