import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { showErrorToast } from '../utils/toast';

export default function MasterHouseholdDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/household/overview');
      const result = await response.json();
      if (result.success) {
        setData(result.household);
      } else {
        showErrorToast('Failed to load household overview');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Error connecting to backend API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
            <Landmark className="w-8 h-8 text-emerald-400" />
            <span>Master Household Overview</span>
          </h1>
          <p className="text-slate-400 mt-1">Real-time combined wealth and yield tracking across workstations.</p>
        </div>
        <button
          onClick={fetchOverview}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Net Worth */}
        <div className="bg-[#0b1220] p-6 rounded-2xl border border-emerald-900/40 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Landmark className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Combined Net Worth</span>
            <div className="text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
              ₱{data.totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 flex flex-col space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Daniel</span>
                <span className="text-slate-300 font-mono">₱{data.danilo.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mira</span>
                <span className="text-slate-300 font-mono">₱{data.wife.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Liquid Cash */}
        <div className="bg-[#0b1220] p-6 rounded-2xl border border-blue-900/40 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-blue-500" />
          </div>
          <div className="relative z-10">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Liquid Cash</span>
            <div className="text-4xl font-extrabold text-white font-mono mt-2 tracking-tight">
              ₱{data.totalLiquidCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 flex flex-col space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Daniel</span>
                <span className="text-slate-300 font-mono">₱{data.danilo.liquidCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mira</span>
                <span className="text-slate-300 font-mono">₱{data.wife.liquidCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Yields */}
        <div className="bg-[#0b1220] p-6 rounded-2xl border border-amber-900/40 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Daily Interest Yields</span>
            <div className="text-4xl font-extrabold text-amber-400 font-mono mt-2 tracking-tight">
              +₱{data.totalDailyInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-4 flex flex-col space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Daniel</span>
                <span className="text-amber-200/70 font-mono">+₱{data.danilo.dailyInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Mira</span>
                <span className="text-amber-200/70 font-mono">+₱{data.wife.dailyInterest.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
