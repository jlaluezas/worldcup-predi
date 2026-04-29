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

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px] -top-20 -left-20"></div>
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -bottom-20 -right-20"></div>
      
      <div className="max-w-md w-full glass p-10 rounded-[3rem] shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">WORLD CUP 2026</h1>
          <p className="text-blue-300/50 text-xs font-bold uppercase tracking-[0.3em] mt-2">The Ultimate Prediction Game</p>
        </div>

        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
          
          <div className="flex gap-4 pt-4">
            <button onClick={() => handleAuth('login')} disabled={loading} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 uppercase text-xs">Entrar</button>
            <button onClick={() => handleAuth('register')} disabled={loading} className="flex-1 glass hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 uppercase text-xs">Unirse</button>
          </div>
        </div>
      </div>
    </div>
  )
}