import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const endpoint = isLoginMode ? '/api/auth/signin' : '/api/auth/signup';
    const payload = isLoginMode
      ? { email: formData.email, password: formData.password }
      : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (isLoginMode) {
          // ⭐ 로그인 성공: JWT 토큰 + 사용자 정보 받기
          const loginResponse = await response.json();

          // localStorage에 토큰 저장
          localStorage.setItem('authToken', loginResponse.token);
          localStorage.setItem('userInfo', JSON.stringify(loginResponse.user));

          setSuccessMessage('로그인 성공!');
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onLogin(loginResponse.user);
          }, 1500);
        } else {
          setSuccessMessage('회원가입 성공!');
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            setIsLoginMode(true);
          }, 1500);
        }
      } else {
        const errorMsg = await response.text();
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      setErrorMessage('서버에 연결할 수 없습니다.');
    }
  };

  const handleModeSwitch = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrorMessage('');
  };

  if (isSuccess) {
    return (
      <div className="login-box" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: '12px' }}>{successMessage}</h2>
        <p style={{ color: 'var(--text-gray)', fontSize: '15px' }}>잠시 후 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="login-box">
      <h2>{isLoginMode ? '로그인' : '회원가입'}</h2>
      <p className="login-subtitle">
        {isLoginMode ? '이메일과 비밀번호를 입력해주세요.' : '계정을 만들어 프롬프트를 안전하게 보호하세요.'}
      </p>

      {errorMessage && (
        <div style={{
          background: '#fff0f0',
          border: '1px solid #ffcccc',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#cc0000',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLoginMode && (
          <div className="input-group">
            <label>사용자 이름</label>
            <input
              name="username"
              type="text"
              placeholder="아이디를 입력하세요"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="input-group">
          <label>이메일 주소</label>
          <input
            name="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>비밀번호</label>
          <input
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {!isLoginMode && (
          <div className="input-group">
            <label>비밀번호 확인</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <button type="submit" className="btn-login-submit">
          {isLoginMode ? '로그인' : '회원가입'}
        </button>
      </form>

      <div className="login-footer">
        <span>{isLoginMode ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}</span>
        <span className="link-signup" onClick={handleModeSwitch}>
          {isLoginMode ? '회원가입' : '로그인'}
        </span>
      </div>
    </div>
  );
};

export default LoginForm;