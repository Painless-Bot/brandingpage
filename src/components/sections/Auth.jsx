import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Auth({ mode = 'login' }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 실제 백엔드 주소 (Spring Boot)
      // const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      
      // 테스트용 임시 로직
      console.log("로그인 시도:", formData);
      localStorage.setItem('token', 'fake-jwt-token'); // 토큰 저장 시뮬레이션
      alert('로그인 성공!');
      navigate('/dashboard'); // 로그인 성공 시 대시보드로 이동
    } catch (error) {
      alert('로그인 실패: 정보를 확인하세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A192F] px-4">
      <div className="max-w-md w-full bg-[#112240] p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {isLogin ? 'Sign In' : 'Join AI_Protect_U'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full bg-[#0A192F] border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-[#64FFDA] outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full bg-[#0A192F] border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-[#64FFDA] outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            className="w-full bg-[#0A192F] border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-[#64FFDA] outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit" className="w-full bg-[#64FFDA] text-[#0A192F] font-bold py-3 rounded-lg hover:bg-[#45ccaa] transition-all transform hover:scale-[1.02]">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        {/* 하단 전환 버튼 생략 */}
      </div>
    </div>
  );
}