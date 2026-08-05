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
  AlertCircle,
  Edit3,
  Trash2,
  Sliders,
  Sparkles,
  ArrowUpRight,
  Wallet,
  Info,
  Layers,
  Check
} from 'lucide-react';

export default function LiabilitiesBNPLTracker({ 
  liabilitiesData, 
  onPayLiability, 
  onCreateLiability,
  onUpdateLiability,
  onDeleteLiability
}) {
  const data = liabilitiesData || {};
  const liabilities = data.enrichedLiabilities || [];
  const liquidity = data.liquidity || {};
  const cashFlow = data.cashFlowSummary || {};

  const [payingLiab, setPayingLiab] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  // Editing state for single liability
  const [editingLiab, setEditingLiab] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    provider: '',
    type: 'bnpl',
    outstandingBalance: '',
    creditLimit: '',
    nominalMonthlyRate: '0',
    monthlyAdminFee: '0',
    billingCycleDueDate: '',
    monthlyPayment: '',
    remainingTermsMonths: '3',
    isZeroInterestPromo: false
  });

  // Adding state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    provider: '',
    type: 'credit_card',
    outstandingBalance: '',
    creditLimit: '',
    nominalMonthlyRate: '3.00',
    monthlyAdminFee: '0',
    billingCycleDueDate: '',
    monthlyPayment: '',
    remainingTermsMonths: '12',
    isZeroInterestPromo: false
  });

  // Quick Batch Edit Balances Modal
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [quickBalances, setQuickBalances] = useState({});

  // Notification Toast
  const [toastMsg, setToastMsg] = useState(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open Edit Modal
  const handleOpenEdit = (liab) => {
    setEditingLiab(liab);
    setEditForm({
      id: liab.id,
      name: liab.name || '',
      provider: liab.provider || '',
      type: liab.type || 'bnpl',
      outstandingBalance: liab.outstandingBalance !== undefined ? liab.outstandingBalance.toString() : '',
      creditLimit: liab.creditLimit !== undefined ? liab.creditLimit.toString() : '',
      nominalMonthlyRate: liab.nominalMonthlyRate !== undefined ? liab.nominalMonthlyRate.toString() : '0',
      monthlyAdminFee: liab.monthlyAdminFee !== undefined ? liab.monthlyAdminFee.toString() : '0',
      billingCycleDueDate: liab.billingCycleDueDate || '',
      monthlyPayment: liab.monthlyPayment !== undefined ? liab.monthlyPayment.toString() : '',
      remainingTermsMonths: liab.remainingTermsMonths !== undefined ? liab.remainingTermsMonths.toString() : '3',
      isZeroInterestPromo: Boolean(liab.isZeroInterestPromo)
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLiab || !onUpdateLiability) return;

    await onUpdateLiability({
      id: editForm.id,
      name: editForm.name,
      provider: editForm.provider,
      type: editForm.type,
      outstandingBalance: parseFloat(editForm.outstandingBalance) || 0,
      creditLimit: parseFloat(editForm.creditLimit) || 0,
      nominalMonthlyRate: parseFloat(editForm.nominalMonthlyRate) || 0,
      monthlyAdminFee: parseFloat(editForm.monthlyAdminFee) || 0,
      billingCycleDueDate: editForm.billingCycleDueDate,
      monthlyPayment: editForm.monthlyPayment ? parseFloat(editForm.monthlyPayment) : undefined,
      remainingTermsMonths: editForm.remainingTermsMonths ? parseInt(editForm.remainingTermsMonths) : 3,
      isZeroInterestPromo: editForm.isZeroInterestPromo
    });

    setEditingLiab(null);
    showToast(`Updated balance & credit line for ${editForm.name}`);
  };

  // Open Quick Edit
  const handleOpenQuickEdit = () => {
    const map = {};
    liabilities.forEach(l => {
      map[l.id] = {
        outstandingBalance: l.outstandingBalance,
        creditLimit: l.creditLimit || (l.outstandingBalance * 2)
      };
    });
    setQuickBalances(map);
    setIsQuickEditOpen(true);
  };

  // Save Quick Edit
  const handleSaveQuickEdit = async (e) => {
    e.preventDefault();
    if (!onUpdateLiability) return;

    for (const liab of liabilities) {
      const entry = quickBalances[liab.id];
      if (entry) {
        await onUpdateLiability({
          id: liab.id,
          outstandingBalance: parseFloat(entry.outstandingBalance) || 0,
          creditLimit: parseFloat(entry.creditLimit) || 0
        });
      }
    }

    setIsQuickEditOpen(false);
    showToast('All liability balances & credit lines updated successfully!');
  };

  // Delete handler
  const handleDelete = async (liab) => {
    if (window.confirm(`Are you sure you want to remove "${liab.name}" from your tracked liabilities?`)) {
      if (onDeleteLiability) {
        await onDeleteLiability(liab.id);
        showToast(`Removed ${liab.name}`);
      }
    }
  };

  // Payoff handlers
  const handleOpenPay = (liab) => {
    setPayingLiab(liab);
    setPayAmount(liab.monthlyPayment ? liab.monthlyPayment.toString() : liab.outstandingBalance.toString());
  };

  const handleExecutePay = async (e) => {
    e.preventDefault();
    if (!payingLiab || !onPayLiability) return;
    await onPayLiability(payingLiab.id, parseFloat(payAmount));
    setPayingLiab(null);
    showToast(`Payment of ₱${parseFloat(payAmount).toLocaleString()} recorded for ${payingLiab.name}!`);
  };

  // Create handler
  const handleCreateLiability = async (e) => {
    e.preventDefault();
    if (!onCreateLiability) return;

    const balance = parseFloat(addForm.outstandingBalance) || 0;
    const limit = addForm.creditLimit ? parseFloat(addForm.creditLimit) : balance * 2;

    await onCreateLiability({
      name: addForm.name,
      provider: addForm.provider,
      type: addForm.type,
      outstandingBalance: balance,
      creditLimit: limit,
      nominalMonthlyRate: parseFloat(addForm.nominalMonthlyRate) || 0,
      monthlyAdminFee: parseFloat(addForm.monthlyAdminFee) || 0,
      billingCycleDueDate: addForm.billingCycleDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      monthlyPayment: addForm.monthlyPayment ? parseFloat(addForm.monthlyPayment) : (balance / (parseInt(addForm.remainingTermsMonths) || 3)),
      remainingTermsMonths: parseInt(addForm.remainingTermsMonths) || 3,
      isZeroInterestPromo: addForm.isZeroInterestPromo
    });

    setIsAddOpen(false);
    setAddForm({
      name: '',
      provider: '',
      type: 'credit_card',
      outstandingBalance: '',
      creditLimit: '',
      nominalMonthlyRate: '3.00',
      monthlyAdminFee: '0',
      billingCycleDueDate: '',
      monthlyPayment: '',
      remainingTermsMonths: '12',
      isZeroInterestPromo: false
    });
    showToast(`Added new credit facility: ${addForm.name}`);
  };

  // Compute total available credit metrics
  const totalOutstandingDebt = data.totalOutstandingDebt || liabilities.reduce((s, l) => s + (l.outstandingBalance || 0), 0);
  const totalCreditLimit = data.totalCreditLimit || liabilities.reduce((s, l) => s + (l.creditLimit || l.outstandingBalance * 2 || 0), 0);
  const totalAvailableCredit = data.totalAvailableCredit !== undefined 
    ? data.totalAvailableCredit 
    : Math.max(0, totalCreditLimit - totalOutstandingDebt);
  const overallCreditUtilization = data.overallCreditUtilization !== undefined 
    ? data.overallCreditUtilization 
    : (totalCreditLimit > 0 ? parseFloat(((totalOutstandingDebt / totalCreditLimit) * 100).toFixed(1)) : 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header & Global Action Triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Liabilities, BNPL & Credit Drag Engine
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
              DRAG MITIGATION
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            Real APR compounding calculator, credit line availability, grace periods, and emergency buffer health.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenQuickEdit}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/80 transition shadow-sm"
            title="Batch edit balances and credit lines across all accounts"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Edit Balances</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-glow-rose transition"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Credit Line / BNPL</span>
          </button>
        </div>
      </div>

      {/* Credit Drag & Liquidity KPIs (Incorporates Total Available Credit Line!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Outstanding Debt */}
        <div className="p-4 rounded-2xl glass-panel border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total Outstanding Debt</span>
            <AlertCircle className="w-4 h-4 text-rose-400/80" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            ₱{totalOutstandingDebt?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mt-1.5">
            <span>High APR (&gt;20%): ₱{data.highInterestDebtTotal?.toLocaleString() || '0'}</span>
            <span className="text-slate-400">DTI: {data.debtToIncomeRatio || '0'}%</span>
          </div>
        </div>

        {/* Total Available Credit Line (NEW & REQUESTED!) */}
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-emerald-950/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-cyan-300 tracking-wider">Available Credit Line</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ₱{totalAvailableCredit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="space-y-1 mt-1.5">
            <div className="flex justify-between text-[11px] text-slate-300 font-medium">
              <span>Facility Limit: <span className="text-white font-mono font-bold">₱{totalCreditLimit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
              <span className={`font-bold ${overallCreditUtilization > 70 ? 'text-rose-400' : overallCreditUtilization > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {overallCreditUtilization}% Utilized
              </span>
            </div>
            {/* Visual utilization bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  overallCreditUtilization > 70 ? 'bg-rose-500' : overallCreditUtilization > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, overallCreditUtilization))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Interest Drag */}
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Monthly Interest Erosion</span>
            <TrendingDown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            -₱{data.monthlyInterestDrag?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}<span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <div className="text-xs text-amber-300 font-semibold mt-1.5">
            Annual Drag: -₱{data.totalAnnualInterestDrag?.toLocaleString() || '0'}/yr
          </div>
        </div>

        {/* Investable Cash Surplus */}
        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Investable Cash Surplus</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ₱{cashFlow.netInvestableSurplus?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}<span className="text-xs text-slate-400 font-normal"> / mo</span>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mt-1.5">
            <span>Installments: ₱{data.totalMonthlyDebtPayments?.toLocaleString() || '0'}/mo</span>
            <span>{cashFlow.savingsRatePercent || '0'}% Savings Rate</span>
          </div>
        </div>
      </div>

      {/* Active Credit & BNPL Table */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-rose-400" />
            <span className="font-bold text-white text-sm">Active Credit Lines, Cards & BNPL Contracts</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded-full border border-slate-700">
              {liabilities.length} Accounts Tracked
            </span>
          </div>
          <div className="text-xs text-slate-400 flex items-center space-x-1">
            <span>Click</span>
            <span className="text-cyan-400 font-semibold px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">✏️ Edit</span>
            <span>on any row to update balances or credit limits</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/95 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Line & Provider</th>
                <th className="py-3.5 px-4 text-right">Outstanding Balance</th>
                <th className="py-3.5 px-4 text-left">Available Credit Line</th>
                <th className="py-3.5 px-4 text-right">Nominal Rate</th>
                <th className="py-3.5 px-4 text-right">Effective APR</th>
                <th className="py-3.5 px-4 text-right">Monthly Drag</th>
                <th className="py-3.5 px-4 text-center">Due Date & Grace</th>
                <th className="py-3.5 px-4 text-center">Urgency</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {liabilities.map((liab) => {
                const isHighApr = liab.effectiveApr >= 20;
                const isCritical = liab.urgency === 'CRITICAL';
                const balance = liab.outstandingBalance || 0;
                const limit = liab.creditLimit || (balance > 0 ? balance * 2 : 10000);
                const available = liab.availableCredit !== undefined 
                  ? liab.availableCredit 
                  : Math.max(0, limit - balance);
                const utilRate = liab.utilizationPercent !== undefined 
                  ? liab.utilizationPercent 
                  : (limit > 0 ? parseFloat(((balance / limit) * 100).toFixed(1)) : 0);

                return (
                  <tr key={liab.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Line & Provider */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">{liab.name}</div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-400">{liab.provider}</span>
                        <span className="text-slate-600">•</span>
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded border ${
                          liab.type === 'credit_card'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : liab.type === 'revolving_credit'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {liab.type?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Outstanding Balance */}
                    <td className="py-4 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        ₱{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {liab.monthlyPayment > 0 && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ₱{liab.monthlyPayment.toLocaleString()}/mo min
                        </div>
                      )}
                    </td>

                    {/* Available Credit Line & Limit (REQUESTED FEATURE) */}
                    <td className="py-4 px-4 text-left">
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        ₱{available.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 font-normal">avail</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              utilRate > 75 ? 'bg-rose-500' : utilRate > 35 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, utilRate))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {utilRate}% of ₱{limit.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Nominal Rate */}
                    <td className="py-4 px-4 text-right font-mono text-slate-300">
                      <div>{liab.nominalMonthlyRate ? `${liab.nominalMonthlyRate}% / mo` : '0.00%'}</div>
                      {liab.monthlyAdminFee > 0 && (
                        <div className="text-[10px] text-slate-400">+₱{liab.monthlyAdminFee} fee</div>
                      )}
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

                    {/* Actions: Edit, Pay Off, Delete */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Edit Button (REQUESTED!) */}
                        <button
                          onClick={() => handleOpenEdit(liab)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center space-x-1"
                          title="Edit balance, credit limit, rates and terms"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {/* Payoff Button */}
                        <button
                          onClick={() => handleOpenPay(liab)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 text-xs font-bold rounded-lg border border-slate-700 transition"
                          title="Record payoff payment"
                        >
                          Pay Off
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(liab)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition rounded hover:bg-slate-800"
                          title="Delete liability"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SINGLE LIABILITY MODAL */}
      {editingLiab && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Account & Credit Line</h3>
                  <p className="text-xs text-slate-400">Update balance, credit line, rate and due date for <span className="text-cyan-400 font-semibold">{editingLiab.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setEditingLiab(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Account Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Provider / Platform</label>
                  <input
                    type="text"
                    value={editForm.provider}
                    onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* PRIMARY USER REQUEST: OUTSTANDING BALANCE & CREDIT LINE */}
              <div className="p-3.5 bg-gradient-to-r from-cyan-950/30 to-slate-950 rounded-xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Balance & Credit Facility Limits</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Outstanding Balance (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.outstandingBalance}
                      onChange={(e) => setEditForm({ ...editForm, outstandingBalance: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-3.5 py-2 text-white font-mono text-sm font-bold focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      Total Credit Limit (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.creditLimit}
                      onChange={(e) => setEditForm({ ...editForm, creditLimit: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3.5 py-2 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                      required
                    />
                  </div>
                </div>

                {/* Real-time Dynamic Computation Preview */}
                {editForm.creditLimit && editForm.outstandingBalance && (
                  <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Calculated Available Credit:</span>
                      <span className="font-bold text-emerald-400">
                        ₱{Math.max(0, parseFloat(editForm.creditLimit) - parseFloat(editForm.outstandingBalance)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Credit Line Utilization:</span>
                      <span className={`font-bold ${
                        (parseFloat(editForm.outstandingBalance) / parseFloat(editForm.creditLimit)) * 100 > 70 
                          ? 'text-rose-400' 
                          : 'text-cyan-400'
                      }`}>
                        {((parseFloat(editForm.outstandingBalance) / parseFloat(editForm.creditLimit)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rates and Fees */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Nominal % / Mo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.nominalMonthlyRate}
                    onChange={(e) => setEditForm({ ...editForm, nominalMonthlyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Admin Fee (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.monthlyAdminFee}
                    onChange={(e) => setEditForm({ ...editForm, monthlyAdminFee: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.billingCycleDueDate}
                    onChange={(e) => setEditForm({ ...editForm, billingCycleDueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Monthly payment & terms */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Monthly Installment (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.monthlyPayment}
                    onChange={(e) => setEditForm({ ...editForm, monthlyPayment: e.target.value })}
                    placeholder="Optional"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="revolving_credit">Revolving Credit (Maya Credit, GCredit)</option>
                    <option value="bnpl">BNPL (GGives, Atome, LazPayLater, SPayLater)</option>
                    <option value="personal_loan">Personal / Bank Loan</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingLiab(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-cyan"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK BATCH EDIT ALL BALANCES MODAL */}
      {isQuickEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Quick Adjust All Balances & Credit Lines</h3>
                  <p className="text-xs text-slate-400">Update current balances and credit limits across all your active accounts simultaneously</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuickEditOpen(false)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
                {liabilities.map((liab) => {
                  const entry = quickBalances[liab.id] || { outstandingBalance: liab.outstandingBalance, creditLimit: liab.creditLimit };
                  const balance = parseFloat(entry.outstandingBalance) || 0;
                  const limit = parseFloat(entry.creditLimit) || (balance * 2);
                  const available = Math.max(0, limit - balance);

                  return (
                    <div key={liab.id} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="sm:w-1/3">
                        <div className="font-bold text-white text-xs">{liab.name}</div>
                        <div className="text-[10px] text-slate-400">{liab.provider}</div>
                      </div>

                      <div className="flex items-center space-x-2 sm:w-2/3">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Outstanding (₱)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.outstandingBalance}
                            onChange={(e) => {
                              setQuickBalances({
                                ...quickBalances,
                                [liab.id]: {
                                  ...entry,
                                  outstandingBalance: e.target.value
                                }
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs font-bold focus:outline-none focus:border-cyan-500"
                            required
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Credit Limit (₱)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.creditLimit}
                            onChange={(e) => {
                              setQuickBalances({
                                ...quickBalances,
                                [liab.id]: {
                                  ...entry,
                                  creditLimit: e.target.value
                                }
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div className="w-24 text-right pt-4">
                          <span className="text-[10px] text-slate-400 block font-mono">Avail:</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ₱{available.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickEditOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-cyan"
                >
                  Save All Balances
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payoff Modal */}
      {payingLiab && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
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
                  <span>Credit Limit:</span>
                  <span className="font-mono font-bold text-emerald-400">₱{payingLiab.creditLimit?.toLocaleString()}</span>
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
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Credit Line or BNPL Contract</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateLiability} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. BDO Platinum Visa / SPayLater"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Provider / Platform</label>
                  <input
                    type="text"
                    value={addForm.provider}
                    onChange={(e) => setAddForm({ ...addForm, provider: e.target.value })}
                    placeholder="e.g. BDO / Shopee"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Type</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="revolving_credit">Revolving Credit</option>
                    <option value="bnpl">BNPL Installment</option>
                    <option value="personal_loan">Personal Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Outstanding Balance (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.outstandingBalance}
                    onChange={(e) => setAddForm({ ...addForm, outstandingBalance: e.target.value })}
                    placeholder="12000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Total Credit Limit (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.creditLimit}
                    onChange={(e) => setAddForm({ ...addForm, creditLimit: e.target.value })}
                    placeholder="50000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nominal % / Mo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addForm.nominalMonthlyRate}
                    onChange={(e) => setAddForm({ ...addForm, nominalMonthlyRate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Billing Due Date</label>
                  <input
                    type="date"
                    value={addForm.billingCycleDueDate}
                    onChange={(e) => setAddForm({ ...addForm, billingCycleDueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
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
