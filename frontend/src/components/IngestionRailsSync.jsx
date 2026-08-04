import React, { useState } from 'react';
import { 
  Radio, 
  RefreshCw, 
  UploadCloud, 
  Terminal, 
  CheckCircle2, 
  Zap, 
  Send, 
  FileText, 
  Clock,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function IngestionRailsSync({ 
  syncLogs, 
  onRunFullSync, 
  onPostMockRail, 
  onUploadStatement, 
  isSyncing 
}) {
  const [selectedRail, setSelectedRail] = useState('maribank');
  const [railPayload, setRailPayload] = useState(
    JSON.stringify({ balance: 195000.0, interestAccrued: 20.03 }, null, 2)
  );
  const [statementText, setStatementText] = useState('');
  const [statementType, setStatementType] = useState('json');
  const [railStatus, setRailStatus] = useState(null);

  const sampleRails = {
    maribank: {
      name: 'MariBank Ingestion Rail',
      endpoint: '/api/sync/maribank',
      sample: { balance: 195000.0, interestAccrued: 20.03 }
    },
    maya: {
      name: 'Maya Bank & Wallet Rail',
      endpoint: '/api/sync/maya',
      sample: { savingsBalance: 125000.0, boostedApy: 10.0, walletBalance: 6500.0 }
    },
    gcash: {
      name: 'GCash & GInvest Holdings Rail',
      endpoint: '/api/sync/gcash',
      sample: {
        walletBalance: 14250.0,
        ginvestHoldings: [
          { fundId: 'fund-atram-tech', unitsHeld: 15.84, averageCost: 1720.0 }
        ]
      }
    },
    gotyme: {
      name: 'GoTyme Bank Rail',
      endpoint: '/api/sync/gotyme',
      sample: {
        balance: 62000.0,
        stashes: [
          { name: 'Emergency Liquid Stash', balance: 50000.0 },
          { name: 'Travel Pocket', balance: 12000.0 }
        ]
      }
    },
    atome: {
      name: 'Atome Netbank & Card Rail',
      endpoint: '/api/sync/atome',
      sample: { savingsBalance: 32000.0, cardOutstanding: 14200.0 }
    }
  };

  const handleSelectRail = (key) => {
    setSelectedRail(key);
    setRailPayload(JSON.stringify(sampleRails[key].sample, null, 2));
    setRailStatus(null);
  };

  const handleSendRailPayload = async () => {
    try {
      const parsed = JSON.parse(railPayload);
      const res = await onPostMockRail(selectedRail, parsed);
      setRailStatus({ success: true, message: `Payload dispatched to ${sampleRails[selectedRail].endpoint}` });
    } catch (e) {
      setRailStatus({ success: false, message: 'Invalid JSON payload string.' });
    }
  };

  const handleStatementParse = async () => {
    if (!statementText.trim()) return;
    const res = await onUploadStatement({
      rawContent: statementText,
      fileType: statementType,
      institution: 'Custom Statement Ingestion'
    });
    if (res.success) {
      setRailStatus({ success: true, message: `Statement parsed: ${res.recordsFound} records ingested.` });
      setStatementText('');
    } else {
      setRailStatus({ success: false, message: res.error || 'Failed to parse statement.' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Data Ingestion Rails & Sync Workers
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
              LOCAL PROXY PIPELINE
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Local webhook proxies, headless session triggers, e-statement parser hooks, and real-time ingestion activity logs.
          </p>
        </div>

        <button
          onClick={onRunFullSync}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-glow-cyan transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Running Pipeline...' : 'Run Full Aggregation Pipeline'}</span>
        </button>
      </div>

      {/* Grid: Rail Dispatcher & Statement Parser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Webhook / Rail Proxy Simulator */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Local Proxy Rail Dispatcher</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">POST /api/sync/*</span>
          </div>

          {/* Rail Selector Tabs */}
          <div className="flex overflow-x-auto space-x-1.5 pb-1 no-scrollbar">
            {Object.keys(sampleRails).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectRail(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedRail === key
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {sampleRails[key].name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Payload Editor */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>JSON Webhook Payload:</span>
              <span className="font-mono text-cyan-400">{sampleRails[selectedRail].endpoint}</span>
            </div>
            <textarea
              rows="6"
              value={railPayload}
              onChange={(e) => setRailPayload(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {railStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              railStatus.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{railStatus.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSendRailPayload}
              className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-glow-cyan transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Inject Ingestion Payload</span>
            </button>
          </div>
        </div>

        {/* Right: Statement Parser Hook */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">E-Statement & Transaction Ingestion</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setStatementType('json')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold ${statementType === 'json' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                JSON
              </button>
              <button
                onClick={() => setStatementType('csv')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold ${statementType === 'csv' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                CSV
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Paste Statement Data ({statementType.toUpperCase()}):</span>
              <button
                onClick={() => {
                  if (statementType === 'json') {
                    setStatementText(JSON.stringify([
                      { date: "2026-08-01", description: "Maya Boosted Interest Credit", amount: 28.45 },
                      { date: "2026-08-02", description: "GInvest Dividend Payout (ALFM)", amount: 350.00 }
                    ], null, 2));
                  } else {
                    setStatementText("Date,Description,Amount\n2026-08-01,MariBank Daily Interest,19.85\n2026-08-02,GCash Cash In,5000.00");
                  }
                }}
                className="text-[11px] text-purple-400 hover:underline"
              >
                Load Sample
              </button>
            </div>
            <textarea
              rows="6"
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder={statementType === 'json' ? '[ { "date": "...", "amount": 100 } ]' : 'Date,Description,Amount...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleStatementParse}
              disabled={!statementText.trim()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-glow-purple transition disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Parse & Ingest Statement</span>
            </button>
          </div>
        </div>

      </div>

      {/* Real-Time Sync & Ingestion Activity Logs */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm">Aggregation Pipeline Activity Log</span>
          </div>
          <span className="text-xs text-slate-400">{syncLogs.length} Events Recorded</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
          {syncLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-800/40 transition flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <span className="font-bold text-slate-200">{log.source}</span>
                  <span className="text-slate-400 ml-2">{log.message}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono whitespace-nowrap ml-4">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {syncLogs.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No recent sync activity logs found.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
