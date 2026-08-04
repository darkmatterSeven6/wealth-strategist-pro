import React, { useState } from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Plus, 
  DollarSign, 
  Percent, 
  TrendingDown,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function LiabilitiesBNPLTracker({ 
  liabilitiesData, 
  onPayLiability, 
  onCreateLiability 
}) {
  const data = liabilitiesData || {};
  const liabilities = data.enrichedLiabilities || [];
  const liquidity = data.liquidity || {};
  const cashFlow = data.cashFlowSummary || {};

  const [payingLiab, setPayingLiab] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addProvider, setAddProvider] = useState('');
  const [addBalance, setAddBalance] = useState('');
  const [addNominalRate, setAddNominalRate] = useState('3.49');
  const [addAdminFee, setAddAdminFee] = useState('0');
  const [addDueDate, setAddDueDate] = useState('');

  const handleOpenPay = (liab) => {
    setPayingLiab(liab);
    setPayAmount(liab.monthlyPayment ? liab.monthlyPayment.toString() : liab.outstandingBalance.toString());
  };

  const handleExecutePay = (e) => {
    e.preventDefault();
    if (!payingLiab) return;
    onPayLiability(payingLiab.id, parseFloat(payAmount));
    setPayingLiab(null);
  };

  const handleCreateLiability = (e) => {
    e.preventDefault();
    onCreateLiability({
      name: addName,
      provider: addProvider,
      outstandingBalance: parseFloat(addBalance),
      nominalMonthlyRate: parseFloat(addNominalRate),
      monthlyAdminFee: parseFloat(addAdminFee),
      billingCycleDueDate: addDueDate
    });
    setIsAddOpen(false);
    setAddName('');
    setAddProvider('');
    setAddBalance('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & New Line Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Liabilities, BNPL & Credit Drag Engine
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
              DRAG MITIGATION
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real APR compounding calculator, billing cycle countdowns, zero-interest grace periods, and emergency buffer health.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          <Plus className="w-4 h-4 text-rose-400" />
          <span>Add Credit Line / BNPL</span>
        </button>
      </div>

      {/* Credit Drag & Liquidity KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Outstanding Debt</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            ₱{data.totalOutstandingDebt?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-rose-400 font-semibold mt-1">
            High APR (&gt;20%): ₱{data.highInterestDebtTotal?.toLocaleString() || '0'}
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Monthly Interest Erosion</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            -₱{data.monthlyInterestDrag?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}<span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <div className="text-xs text-amber-300 font-semibold mt-1">
            Annual Drag: -₱{data.totalAnnualInterestDrag?.toLocaleString() || '0'}/yr
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Monthly Debt Installments</span>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
            ₱{data.totalMonthlyDebtPayments?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-1">
            Debt-to-Income: {data.debtToIncomeRatio || '0'}%
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/60">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Investable Cash Surplus</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ₱{cashFlow.netInvestableSurplus?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}<span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <div className="text-xs text-emerald-300 font-semibold mt-1">
            {cashFlow.savingsRatePercent || '0'}% Net Savings Rate
          </div>
        </div>
      </div>

      {/* Active Credit & BNPL Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <span className="font-bold text-white text-sm">Active Credit Lines & BNPL Contracts</span>
          <span className="text-xs text-slate-400">Sort: Compounded APR (High to Low)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Line & Provider</th>
                <th className="py-3.5 px-4 text-right">Outstanding Balance</th>
                <th className="py-3.5 px-4 text-right">Nominal Rate / Mo</th>
                <th className="py-3.5 px-4 text-right">Effective Compounded APR</th>
                <th className="py-3.5 px-4 text-right">Monthly Drag Cost</th>
                <th className="py-3.5 px-4 text-center">Due Date & Grace Period</th>
                <th className="py-3.5 px-4 text-center">Urgency</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {liabilities.map((liab) => {
                const isHighApr = liab.effectiveApr >= 20;
                const isCritical = liab.urgency === 'CRITICAL';
                return (
                  <tr key={liab.id} className="hover:bg-slate-800/40 transition">
                    {/* Line & Provider */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{liab.name}</div>
                      <div className="text-[11px] text-slate-400">{liab.provider} • {liab.type.toUpperCase()}</div>
                    </td>

                    {/* Balance */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-white text-sm">
                      ₱{liab.outstandingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Nominal Rate */}
                    <td className="py-4 px-4 text-right font-mono text-slate-300">
                      {liab.nominalMonthlyRate ? `${liab.nominalMonthlyRate}% / mo` : '0.00%'}
                    </td>

                    {/* Effective APR */}
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        liab.effectiveApr > 35
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : liab.effectiveApr > 0
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {liab.effectiveApr}% APR
                      </span>
                    </td>

                    {/* Monthly Drag */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-rose-400">
                      {liab.monthlyInterestCost > 0 ? `-₱${liab.monthlyInterestCost?.toLocaleString()}` : '₱0.00'}
                    </td>

                    {/* Grace Period Countdown */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1 font-mono text-xs">
                        <Clock className={`w-3.5 h-3.5 ${isCritical ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className={`font-bold ${isCritical ? 'text-rose-400' : 'text-slate-200'}`}>
                          {liab.daysUntilDue} Days Left
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Due: {liab.billingCycleDueDate}
                      </span>
                    </td>

                    {/* Urgency */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        liab.urgency === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : liab.urgency === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {liab.urgency}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleOpenPay(liab)}
                        className="px-3 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition"
                      >
                        Pay Off
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payoff Modal */}
      {payingLiab && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Record Debt Payoff</h3>
                <p className="text-xs text-rose-400">{payingLiab.name}</p>
              </div>
              <button onClick={() => setPayingLiab(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleExecutePay} className="space-y-4">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Current Outstanding:</span>
                  <span className="font-mono font-bold text-white">₱{payingLiab.outstandingBalance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Effective APR:</span>
                  <span className="font-mono font-bold text-rose-400">{payingLiab.effectiveApr}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Amount (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingLiab(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-emerald"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Liability Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Credit Line or BNPL Contract</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateLiability} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. SPayLater Gadget"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Provider / Platform</label>
                <input
                  type="text"
                  value={addProvider}
                  onChange={(e) => setAddProvider(e.target.value)}
                  placeholder="e.g. Shopee / SeaMoney"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Outstanding (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addBalance}
                    onChange={(e) => setAddBalance(e.target.value)}
                    placeholder="12000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nominal % / Mo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addNominalRate}
                    onChange={(e) => setAddNominalRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
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
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold rounded-xl"
                >
                  Add Liability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
