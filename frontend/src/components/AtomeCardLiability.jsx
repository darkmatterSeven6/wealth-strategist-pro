import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sliders,
  Sparkles,
  DollarSign,
  AlertCircle,
  Receipt,
  CheckCircle2,
  Clock,
  Zap,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

export default function AtomeCardLiability({
  creditCardData,
  onRefresh,
  showToast
}) {
  // Default fallback data matching schema specifications
  const defaultCard = {
    id: 'card-atome-01',
    cardName: 'Atome Card (Mastercard)',
    cardNumber: '•••• 5956',
    cardBrand: 'Mastercard',
    totalLimit: 10000.00,
    availableLimit: 5811.42,
    outstandingBalance: 4188.58,
    dueDate: '2026-08-18',
    statementDate: '2026-08-03',
    billingCycleDay: 18,
    minAmountDue: 209.43,
    annualFee: 0.00,
    interestRateApr: 0.00,
    status: 'active',
    transactions: [
      {
        id: 'ctx-01',
        merchant: 'GrabFood Philippines',
        amount: 489.00,
        type: 'purchase',
        category: 'Food & Dining',
        date: '2026-08-07T14:22:00.000Z',
        ref: 'ATM-TX-98421'
      },
      {
        id: 'ctx-02',
        merchant: 'ShopeePay Top-up',
        amount: 1200.00,
        type: 'purchase',
        category: 'Shopping',
        date: '2026-08-05T09:15:00.000Z',
        ref: 'ATM-TX-97812'
      },
      {
        id: 'ctx-03',
        merchant: 'SM Supermarket BGC',
        amount: 2499.58,
        type: 'purchase',
        category: 'Groceries',
        date: '2026-08-02T19:40:00.000Z',
        ref: 'ATM-TX-96540'
      },
      {
        id: 'ctx-04',
        merchant: 'Atome Bill Repayment (via Maya)',
        amount: 3500.00,
        type: 'bill_payment',
        category: 'Payment / Credit',
        date: '2026-07-28T11:05:00.000Z',
        ref: 'PAY-ATM-44192'
      }
    ]
  };

  const card = creditCardData || defaultCard;

  // Calculate dynamic metrics
  const totalLimit = card.totalLimit || 10000.00;
  const availableLimit = card.availableLimit !== undefined ? card.availableLimit : 5811.42;
  const outstandingBalance = card.outstandingBalance !== undefined 
    ? card.outstandingBalance 
    : Math.max(0, parseFloat((totalLimit - availableLimit).toFixed(2)));
  const utilizationPercent = totalLimit > 0 ? parseFloat(((outstandingBalance / totalLimit) * 100).toFixed(1)) : 0;
  
  // Calculate days until due
  let daysUntilDue = 10;
  if (card.dueDate) {
    const due = new Date(card.dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    daysUntilDue = diff >= 0 ? diff : 0;
  }

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [txForm, setTxForm] = useState({
    merchant: '',
    amount: '',
    type: 'purchase',
    category: 'Shopping'
  });

  const [payForm, setPayForm] = useState({
    amount: (card.minAmountDue || 209.43).toString(),
    source: 'Maya Bank'
  });

  const [editForm, setEditForm] = useState({
    cardName: card.cardName || 'Atome Card (Mastercard)',
    cardNumber: card.cardNumber || '•••• 5956',
    totalLimit: totalLimit.toString(),
    availableLimit: availableLimit.toString(),
    dueDate: card.dueDate || '2026-08-18',
    statementDate: card.statementDate || '2026-08-03'
  });

  // Handle Record Transaction
  const handleRecordTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.merchant || !txForm.amount) return;

    setIsSubmitting(true);
    try {
      const res = await api.addCardTransaction({
        cardId: card.id,
        merchant: txForm.merchant,
        amount: parseFloat(txForm.amount),
        type: txForm.type,
        category: txForm.category
      });

      if (res.success) {
        if (showToast) showToast('success', 'Transaction Recorded', `${txForm.type === 'purchase' ? 'Spent' : 'Credit'} ₱${parseFloat(txForm.amount).toLocaleString()} at ${txForm.merchant}`);
        setIsTxModalOpen(false);
        setTxForm({ merchant: '', amount: '', type: 'purchase', category: 'Shopping' });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      if (showToast) showToast('error', 'Transaction Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Pay Bill
  const handlePayBill = async (e) => {
    e.preventDefault();
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await api.payCreditCard({
        id: card.id,
        paymentAmount: parseFloat(payForm.amount),
        paymentSource: payForm.source
      });

      if (res.success) {
        if (showToast) showToast('success', 'Payment Processed', `₱${parseFloat(payForm.amount).toLocaleString()} paid via ${payForm.source}. Available limit restored!`);
        setIsPayModalOpen(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      if (showToast) showToast('error', 'Payment Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        id: card.id || 1,
        card_name: editForm.cardName,
        cardName: editForm.cardName,
        card_number: editForm.cardNumber,
        cardNumber: editForm.cardNumber,
        total_limit: parseFloat(editForm.totalLimit),
        totalLimit: parseFloat(editForm.totalLimit),
        available_limit: parseFloat(editForm.availableLimit),
        availableLimit: parseFloat(editForm.availableLimit),
        due_date: editForm.dueDate,
        dueDate: editForm.dueDate,
        statement_date: editForm.statementDate,
        statementDate: editForm.statementDate,
        billing_cycle_day: 18,
        billingCycleDay: 18
      };

      const res = await api.updateCreditCard(payload);

      if (res.success) {
        if (showToast) showToast('success', 'Card Settings Saved', `Available ₱${parseFloat(editForm.availableLimit).toLocaleString()} / Total ₱${parseFloat(editForm.totalLimit).toLocaleString()}`);
        setIsEditModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        if (showToast) showToast('error', 'Update Failed', res.error || 'Unable to save settings');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const transactions = card.transactions || defaultCard.transactions;

  return (
    <div className="rounded-3xl glass-panel border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 shadow-2xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/20 text-white font-black text-xs">
              ATM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Atome Card (Mastercard) Revolving Facility
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE REVOLVING LINE</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated credit limit tracking, merchant expense ingestion & instant repayment sync
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Cluster */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTxModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700/80 transition shadow-sm active:scale-95"
            title="Record a merchant transaction or charge"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>+ Charge / Spend</span>
          </button>

          <button
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95"
            title="Make a payment towards outstanding balance"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-200" />
            <span>Pay Bill / Settle</span>
          </button>

          <button
            onClick={() => {
              setEditForm({
                cardName: card.cardName || 'Atome Card (Mastercard)',
                cardNumber: card.cardNumber || '•••• 5956',
                totalLimit: totalLimit.toString(),
                availableLimit: availableLimit.toString(),
                dueDate: card.dueDate || '2026-08-18',
                statementDate: card.statementDate || '2026-08-03'
              });
              setIsEditModalOpen(true);
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 rounded-xl border border-slate-700/80 transition"
            title="Configure Limits & Dates"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Credit Card on Left, Live Financial HUD on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* LEFT: Photorealistic Glassmorphism Mastercard */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm h-52 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-black">
            
            {/* Holographic Card Background Sheen */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-600/30 via-pink-900/10 to-transparent pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Top Row: Network & Chip */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 tracking-wider">
                  atome
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Card
                </span>
              </div>
              
              {/* Contactless Wave Icon */}
              <div className="flex items-center space-x-2 text-slate-400">
                <svg className="w-5 h-5 text-slate-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
            </div>

            {/* Middle: EMV Gold Chip */}
            <div className="flex items-center space-x-3 z-10 my-auto">
              <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border border-amber-600/50 shadow-inner flex items-center justify-center p-1 relative overflow-hidden">
                <div className="w-full h-full border border-amber-700/40 rounded-[2px] grid grid-cols-2 gap-0.5 opacity-60">
                  <div className="border-r border-amber-800" />
                  <div />
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/90 font-bold tracking-wider uppercase px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-500/30">
                0% INT PROMO
              </span>
            </div>

            {/* Bottom: Card Number & Expiry & Mastercard Logo */}
            <div className="space-y-2 z-10">
              <div className="font-mono text-lg font-bold text-white tracking-[0.2em] drop-shadow-md">
                {card.cardNumber || '•••• •••• •••• 5956'}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-widest">Cardholder</div>
                  <div className="text-xs font-bold text-slate-200 tracking-wider">DANIEL SANTOS</div>
                </div>

                <div className="text-right mr-4">
                  <div className="text-[8px] text-slate-400 uppercase tracking-widest">Valid Thru</div>
                  <div className="text-xs font-mono font-bold text-slate-200">08/29</div>
                </div>

                {/* Mastercard Dual Circle Logo */}
                <div className="flex items-center -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600 opacity-90 shadow-sm" />
                  <div className="w-6 h-6 rounded-full bg-amber-500 opacity-90 shadow-sm" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: Financial HUD Metrics & Limit Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Credit Limit */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Credit Limit</div>
              <div className="text-lg font-black text-white font-mono mt-1">
                ₱{totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Assigned Facility</div>
            </div>

            {/* Available Spending Limit */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 shadow-sm">
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                <span>Available Limit</span>
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                ₱{availableLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-emerald-500/90 font-medium mt-0.5">Ready for purchases</div>
            </div>

            {/* Outstanding Balance */}
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 shadow-sm">
              <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider flex items-center justify-between">
                <span>Outstanding Balance</span>
                <AlertCircle className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-lg font-black text-rose-400 font-mono mt-1">
                ₱{outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-rose-500/90 font-medium mt-0.5">
                Min Due: ₱{(card.minAmountDue || 209.43).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Credit Utilization Progress Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">Credit Line Utilization</span>
              <span className={`font-mono font-bold ${
                utilizationPercent > 70 ? 'text-rose-400' : utilizationPercent > 35 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {utilizationPercent}% Utilized (₱{outstandingBalance.toLocaleString()} / ₱{totalLimit.toLocaleString()})
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilizationPercent > 70 
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                    : utilizationPercent > 35 
                    ? 'bg-gradient-to-r from-cyan-500 to-amber-400' 
                    : 'bg-gradient-to-r from-teal-400 to-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, utilizationPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Due Date: <strong className="text-slate-200">{card.dueDate || '2026-08-18'}</strong></span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Grace Period: <strong className="text-amber-300">{daysUntilDue} Days Left</strong></span>
              </div>

              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Annual Fee: <strong className="text-emerald-300">₱0 (Free for Life)</strong></span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* RECENT CARD TRANSACTIONS & BILL PAYMENT LEDGER */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recent Atome Card Transactions & Repayment Credits ({transactions.length})
            </h4>
          </div>

          <button
            onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition"
          >
            <span>{isLedgerExpanded ? 'Collapse Ledger' : 'Expand Ledger'}</span>
            {isLedgerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isLedgerExpanded && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60 text-xs">
            {transactions.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No recent transactions recorded.</div>
            ) : (
              transactions.map((tx) => {
                const isPayment = tx.type === 'bill_payment' || tx.type === 'refund';
                const dateStr = tx.date ? new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-900/50 transition">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isPayment ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isPayment ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{tx.merchant}</div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span className="text-slate-500">{tx.category || 'General'}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">{tx.ref || 'ATM-REF'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold text-sm ${isPayment ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPayment ? '+' : '-'}₱{tx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {isPayment ? 'Repayment Credit' : 'Card Purchase'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: RECORD MERCHANT TRANSACTION / CHARGE */}
      {/* ========================================================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-white text-base">Record Card Purchase</h3>
              </div>
              <button 
                onClick={() => setIsTxModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Merchant / Store Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GrabFood, ShopeePay, Zara, SM Supermarket"
                  value={txForm.merchant}
                  onChange={(e) => setTxForm({ ...txForm, merchant: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Amount (PHP ₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Shopping">Shopping & Retail</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transport">Transport / Fuel</option>
                    <option value="Utilities">Bills & Utilities</option>
                    <option value="Travel">Travel & Lodging</option>
                    <option value="General">General Expense</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Current Available Limit:</span>
                  <span className="font-mono text-emerald-400 font-bold">₱{availableLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Available Limit:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    ₱{Math.max(0, availableLimit - (parseFloat(txForm.amount) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PAY BILL / SETTLE CARD BALANCE */}
      {/* ========================================================= */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Settle Atome Card Balance</h3>
              </div>
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayBill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Payment Source</label>
                <select
                  value={payForm.source}
                  onChange={(e) => setPayForm({ ...payForm, source: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Maya Bank">Maya Bank (Boosted Tier)</option>
                  <option value="MariBank">MariBank Savings</option>
                  <option value="GoTyme Bank">GoTyme Bank</option>
                  <option value="GCash">GCash Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Payment Amount (PHP ₱)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={payForm.amount}
                  onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPayForm({ ...payForm, amount: (card.minAmountDue || 209.43).toString() })}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono text-[10px] border border-slate-700 transition"
                >
                  Min Due (₱{(card.minAmountDue || 209.43).toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setPayForm({ ...payForm, amount: outstandingBalance.toString() })}
                  className="flex-1 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 rounded-lg font-mono text-[10px] border border-emerald-500/30 transition font-bold"
                >
                  Full (₱{outstandingBalance.toLocaleString()})
                </button>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Current Outstanding:</span>
                  <span className="font-mono text-rose-400 font-bold">₱{outstandingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Outstanding After Payment:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ₱{Math.max(0, outstandingBalance - (parseFloat(payForm.amount) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Restored Available Limit:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    ₱{Math.min(totalLimit, availableLimit + (parseFloat(payForm.amount) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CARD CONFIGURATION & LIMIT OVERRIDE */}
      {/* ========================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-white text-base">Atome Card Settings & Limits</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Card Display Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.cardName}
                    onChange={(e) => setEditForm({ ...editForm, cardName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Card Number (Masked)</label>
                  <input
                    type="text"
                    required
                    value={editForm.cardNumber}
                    onChange={(e) => setEditForm({ ...editForm, cardNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Total Credit Limit (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.totalLimit}
                    onChange={(e) => setEditForm({ ...editForm, totalLimit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Available Limit (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.availableLimit}
                    onChange={(e) => setEditForm({ ...editForm, availableLimit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Statement Date</label>
                  <input
                    type="date"
                    value={editForm.statementDate}
                    onChange={(e) => setEditForm({ ...editForm, statementDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-lg shadow-cyan-600/30 flex items-center justify-center space-x-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
