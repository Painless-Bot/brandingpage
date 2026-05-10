export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
      {/* 로고 부분 */}
      <div className="text-2xl font-bold text-[#64FFDA] tracking-tighter">
        AI_PROTECT_U
      </div>
      
      {/* 메뉴 부분 (데스크탑용) */}
      <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
        <a href="#home" className="hover:text-[#64FFDA] transition-colors">Home</a>
        <a href="#tech" className="hover:text-[#64FFDA] transition-colors">Technology</a>
        <a href="#hardware" className="hover:text-[#64FFDA] transition-colors">Hardware</a>
      </div>

      {/* 버튼 부분 */}
      <div>
        <button className="border border-[#64FFDA] text-[#64FFDA] px-5 py-2 rounded-md text-sm hover:bg-[#64FFDA]/10 transition">
          Launch Demo
        </button>
      </div>
    </nav>
  );
}