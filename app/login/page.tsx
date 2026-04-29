"use client"
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async (action: 'login' | 'register') => {
    setLoading(true)
    const { error } = action === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) alert(error.message)
    else router.push('/')
    setLoading(false)
  }

  // NUEVA FUNCIÓN: Login con Google
  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20 pointer-events-none"></div>
      
      <div className="max-w-md w-full glass p-10 rounded-[3rem] shadow-2xl relative z-10 border border-white/10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">WORLD CUP 2026</h1>
          <p className="text-blue-300/50 text-xs font-bold uppercase tracking-[0.3em] mt-2">The Ultimate Prediction Game</p>
        </div>

        <div className="space-y-6">
          
          {/* BOTÓN DE GOOGLE */}
          <button 
            onClick={handleGoogleLogin} 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="uppercase text-xs tracking-widest">Continuar con Google</span>
          </button>

          {/* DIVISOR */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-white/10"></div>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">O usa tu email</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>

          {/* LOGIN CON EMAIL */}
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-sm" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            
            <div className="flex gap-4 pt-2">
              <button onClick={() => handleAuth('login')} disabled={loading} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest">Entrar</button>
              <button onClick={() => handleAuth('register')} disabled={loading} className="flex-1 glass hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest border border-white/10">Unirse</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}