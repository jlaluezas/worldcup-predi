"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('todos')
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else { setUser(user); fetchData(user.id) }
    }
    checkUser()
  }, [])

  const fetchData = async (userId: string) => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(p); setUsernameInput(p?.username || '')
    const { data: m } = await supabase.from('matches').select('*').order('kickoff')
    setMatches(m || [])
    const { data: pr } = await supabase.from('predictions').select('*').eq('user_id', userId)
    const obj: any = {}; pr?.forEach((x: any) => obj[x.match_id] = { a: x.guess_a, b: x.guess_b })
    setPredictions(obj); setLoading(false)
  }

  const isLocked = (kickoff: string) => new Date().getTime() > (new Date(kickoff).getTime() - 4 * 60 * 60 * 1000)

  const save = async (mId: string, kick: string, a: number, b: number) => {
    if (isLocked(kick)) return
    await supabase.from('predictions').upsert({ user_id: user.id, match_id: mId, guess_a: a, guess_b: b }, { onConflict: 'user_id,match_id' })
  }

  const filtered = selectedDate === 'todos' ? matches : matches.filter(m => new Date(m.kickoff).toLocaleDateString('es-ES') === selectedDate)
  const uniqueDates = Array.from(new Set(matches.map(m => new Date(m.kickoff).toLocaleDateString('es-ES'))))

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <main className="min-h-screen bg-[#0f172a] text-white pb-20">
      <div className="max-w-xl mx-auto px-4 pt-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent uppercase">World Cup 2026</h1>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="glass p-3 rounded-full hover:bg-red-500/20 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg></button>
        </header>

        <nav className="flex glass p-1 rounded-2xl mb-8">
          <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-white/10 rounded-xl shadow-xl">Partidos</button>
          <button onClick={() => router.push('/leaderboard')} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Ranking</button>
        </nav>

        <section className="glass p-6 rounded-[2.5rem] mb-10 border-yellow-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 mb-3">Player Identity</p>
          <div className="flex gap-2">
            <input type="text" className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-yellow-500/50" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
            <button onClick={async () => { await supabase.from('profiles').update({ username: usernameInput }).eq('id', user.id); alert("Apodo actualizado") }} className="bg-yellow-500 text-black px-5 rounded-xl font-black text-[10px] uppercase tracking-widest">OK</button>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          <button onClick={() => setSelectedDate('todos')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDate === 'todos' ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'glass text-gray-400'}`}>Todos</button>
          {uniqueDates.map(d => (
            <button key={d} onClick={() => setSelectedDate(d)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDate === d ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'glass text-gray-400'}`}>{d}</button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(m => {
            const locked = isLocked(m.kickoff)
            return (
              <div key={m.id} className={`glass p-8 rounded-[2.5rem] border-white/5 transition-all ${locked ? 'opacity-60 bg-black/40' : 'hover:border-yellow-500/30'}`}>
                <div className="flex justify-center mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase ${locked ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {locked ? '🔒 Bloqueado' : new Date(m.kickoff).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' hs'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 text-right font-black text-sm uppercase italic tracking-tighter">{m.team_a}</div>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    <input type="number" disabled={locked} className="w-10 h-12 bg-transparent text-center text-2xl font-black outline-none" value={predictions[m.id]?.a ?? ''} onChange={e => {
                      const v = parseInt(e.target.value) || 0
                      setPredictions({ ...predictions, [m.id]: { ...predictions[m.id], a: v } })
                      save(m.id, m.kickoff, v, predictions[m.id]?.b || 0)
                    }} />
                    <div className="w-[1px] h-6 bg-white/10"></div>
                    <input type="number" disabled={locked} className="w-10 h-12 bg-transparent text-center text-2xl font-black outline-none" value={predictions[m.id]?.b ?? ''} onChange={e => {
                      const v = parseInt(e.target.value) || 0
                      setPredictions({ ...predictions, [m.id]: { ...predictions[m.id], b: v } })
                      save(m.id, m.kickoff, predictions[m.id]?.a || 0, v)
                    }} />
                  </div>
                  <div className="flex-1 text-left font-black text-sm uppercase italic tracking-tighter">{m.team_b}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}