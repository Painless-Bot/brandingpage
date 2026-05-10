import React from 'react';

export default function Dashboard() {
  const stats = [
    { label: "Detected PII", value: "124", color: "text-red-400" },
    { label: "Hardware Status", value: "Secure", color: "text-green-400" },
    { label: "Protected Prompts", value: "1,042", color: "text-[#64FFDA]" }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] pt-24 px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white">Security Overview</h1>
          <p className="text-slate-400">Welcome back, Chan-Yeong. Monitoring your AI data in real-time.</p>
        </header>

        {/* 상단 요약 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#112240] p-6 rounded-xl border border-slate-700 shadow-lg">
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 핵심 기능 섹션: NER 탐지 시연 영역 */}
        <div className="bg-[#112240] p-8 rounded-2xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6 font-mono text-center">AI Privacy Shield Console</h2>
          <div className="bg-[#0A192F] p-4 rounded-lg border border-slate-800 h-64 flex flex-col items-center justify-center">
             <p className="text-[#64FFDA] font-mono animate-pulse mb-2">System Ready...</p>
             <p className="text-slate-500 text-sm">Waiting for AI Prompt input to scan...</p>
             <button className="mt-6 px-6 py-2 border border-[#64FFDA] text-[#64FFDA] rounded-full hover:bg-[#64FFDA]/10 transition-colors">
               Start Scan
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}