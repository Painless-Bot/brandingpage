import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App' // 확장자 없이 깔끔하게!

// document.getElementById('root') 뒤에 있던 '!'를 제거했습니다.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)