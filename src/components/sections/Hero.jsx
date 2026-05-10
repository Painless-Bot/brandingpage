export default function Hero() {
  return (
    <section id="home" className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      {/* 상단 작은 태그 */}
      <span className="text-[#64FFDA] font-mono text-sm mb-4 tracking-widest uppercase">
        Next-Gen Prompt Security
      </span>
      
      {/* 메인 슬로건 */}
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
        Hardware-Rooted <br />
        <span className="text-slate-400">Privacy for AI Prompts</span>
      </h1>
      
      {/* 서브 설명 */}
      <p className="max-w-2xl text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
        We bridge the gap between AI convenience and absolute privacy. 
        Your data is isolated in <span className="text-[#64FFDA]">Hardware TEE</span>, 
        making it invisible even to the most advanced threats.
      </p>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="bg-[#64FFDA] text-[#0A192F] px-10 py-4 rounded-md font-bold text-lg hover:shadow-[0_0_30px_rgba(100,255,218,0.4)] transition-all">
          Explore Our Technology
        </button>
        <button className="text-slate-300 border border-slate-700 px-10 py-4 rounded-md font-bold text-lg hover:bg-slate-800 transition">
          Whitepaper
        </button>
      </div>
    </section>
  );
}