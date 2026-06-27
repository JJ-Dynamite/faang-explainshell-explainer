'use client';

import { useState } from 'react';

export default function Home() {
  const [command, setCommand] = useState('');
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const safeCommands = [
    { cmd: 'ls -la', desc: 'List all files with details' },
    { cmd: 'grep -r "pattern" .', desc: 'Search for pattern in files' },
    { cmd: 'find . -name "*.js"', desc: 'Find JavaScript files' },
    { cmd: 'du -sh *', desc: 'Show directory sizes' },
  ];

  const handleExplain = async () => {
    if (!command) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (data.success) setExplanation(data.data);
    } catch (error) {
      console.error('Explain failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">💻</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ExplainShell
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Understand any terminal command</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter a terminal command..."
              className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 font-mono"
              onKeyPress={(e) => e.key === 'Enter' && handleExplain()}
            />
            <button
              onClick={handleExplain}
              disabled={!command || loading}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : '🔍 Explain'}
            </button>
          </div>
        </div>

        {explanation && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-2">{explanation.command}</h3>
              <p className="text-gray-300">{explanation.description}</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Breakdown</h3>
              <div className="space-y-3">
                {explanation.components.map((comp: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                    <span className="font-mono text-cyan-400 bg-slate-900 px-3 py-1 rounded-lg text-sm min-w-[100px]">
                      {comp.part}
                    </span>
                    <span className="text-gray-300">{comp.meaning}</span>
                  </div>
                ))}
              </div>
            </div>

            {explanation.examples?.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Examples</h3>
                <div className="space-y-2">
                  {explanation.examples.map((ex: string, i: number) => (
                    <div key={i} className="p-3 bg-slate-900 rounded-lg font-mono text-sm text-gray-300">
                      $ {ex}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Related Commands</h3>
              <div className="flex flex-wrap gap-2">
                {explanation.related_commands?.map((cmd: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCommand(cmd)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-mono text-sm transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-slate-800/30 rounded-xl p-6 border border-slate-700">
          <h3 className="font-semibold mb-4">Try these commands</h3>
          <div className="grid grid-cols-2 gap-3">
            {safeCommands.map((sc, i) => (
              <button
                key={i}
                onClick={() => setCommand(sc.cmd)}
                className="p-3 bg-slate-700/30 rounded-lg text-left hover:bg-slate-700/50 transition-colors"
              >
                <p className="font-mono text-cyan-400 text-sm">{sc.cmd}</p>
                <p className="text-xs text-gray-400 mt-1">{sc.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
