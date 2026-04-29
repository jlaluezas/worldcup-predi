"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [avatarInput, setAvatarInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user) return router.push('/login')
      setUser(user)
      
      // 1. Perfil
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if(!p) {
        // Crear perfil si no existe
        await supabase.from('profiles').insert({ id: user.id, username: user.email?.split('@')[0] })
        window.location.reload()
      }
      setProfile(p); setUsernameInput(p?.username || ''); setAvatarInput(p?.avatar_url || '')

      // 2. Partidos con JOIN a Equipos
      const { data: m } = await supabase.from('matches').select(`
        *,
        team_a:team_a_id (name, logo_url),
        team_b:team_b_id (name, logo_url)
      `).order('kickoff')
      setMatches(m || [])

      // 3. Predicciones
      const { data: pr } = await supabase.from('predictions').select('*').eq('user_id', user.id)
      const obj: any = {}; pr?.forEach(x => obj[x.match_id] = { a: x.guess_a, b: x.guess_b })
      setPredictions(obj)
      
      setLoading(false)
    }
    check()
  }, [])

  const savePrediction = async (mId: string, kickoff: string, a: number, b: number) => {
    const locked = new Date().getTime() > (new Date(kickoff).getTime() - 4 * 60 * 60 * 1000)
    if(locked) return alert("Cerrado")
    await supabase.from('predictions').upsert({ user_id: user.id, match_id: mId, guess_a: a, guess_b: b }, { onConflict: 'user_id,match_id' })
  }

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-black text-yellow-500 animate-pulse">CARGANDO MUNDIAL...</div>

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* SIDEBAR */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-10">
            <div className="glass p-6 rounded-[2.5rem] border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} className="w-14 h-14 rounded-full border-2 border-yellow-500 p-0.5" />
                <div>
                  <h2 className="font-black uppercase italic tracking-tighter truncate w-32">{profile?.username}</h2>
                  <p className="text-yellow-500 font-black text-xs">{profile?.points} PTS</p>
                </div>
              </div>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} className="w-full py-2 glass rounded-xl text-[9px] font-black uppercase tracking-widest">Editar Perfil</button>
              ) : (
                <div className="space-y-2">
                  <input className="w-full bg-black/40 p-2 rounded text-xs" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="User" />
                  <input className="w-full bg-black/40 p-2 rounded text-xs" value={avatarInput} onChange={e => setAvatarInput(e.target.value)} placeholder="Avatar URL" />
                  <button onClick={async () => { 
                    await supabase.from('profiles').update({ username: usernameInput, avatar_url: avatarInput }).eq('id', user.id)
                    setProfile({...profile, username: usernameInput, avatar_url: avatarInput})
                    setEditMode(false)
                  }} className="w-full bg-yellow-500 text-black py-2 rounded-xl font-black text-[9px] uppercase">Guardar</button>
                </div>
              )}
            </div>

            <nav className="space-y-2">
              <button className="w-full p-4 bg-yellow-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest">⚽ Partidos</button>
              <button onClick={() => router.push('/leaderboard')} className="w-full p-4 glass rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400">🏆 Ranking</button>
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full p-4 text-red-500 font-black text-xs uppercase tracking-widest">🚪 Salir</button>
            </nav>
          </aside>

          {/* PARTIDOS */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-6">Próximos Partidos</h2>
            {matches.map(m => {
              const locked = new Date().getTime() > (new Date(m.kickoff).getTime() - 4 * 60 * 60 * 1000)
              return (
                <div key={m.id} className={`glass p-8 rounded-[3rem] transition-all ${locked ? 'opacity-40' : 'hover:border-yellow-500/20'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col items-center lg:flex-row lg:justify-end gap-3 text-right">
                      <span className="font-black text-lg lg:text-2xl uppercase italic tracking-tighter order-2 lg:order-1">{m.team_a?.name}</span>
                      <img src={m.team_a?.logo_url} className="w-12 h-12 lg:w-16 lg:h-16 object-contain order-1 lg:order-2" />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{new Date(m.kickoff).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                        <input type="number" disabled={locked} className="w-10 h-12 bg-transparent text-center text-2xl font-black outline-none" value={predictions[m.id]?.a ?? ''} onChange={e => {
                          const val = parseInt(e.target.value) || 0
                          setPredictions({...predictions, [m.id]: {...predictions[m.id], a: val}})
                          savePrediction(m.id, m.kickoff, val, predictions[m.id]?.b || 0)
                        }} />
                        <div className="w-[1px] h-6 bg-white/10"></div>
                        <input type="number" disabled={locked} className="w-10 h-12 bg-transparent text-center text-2xl font-black outline-none" value={predictions[m.id]?.b ?? ''} onChange={e => {
                          const val = parseInt(e.target.value) || 0
                          setPredictions({...predictions, [m.id]: {...predictions[m.id], b: val}})
                          savePrediction(m.id, m.kickoff, predictions[m.id]?.a || 0, val)
                        }} />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center lg:flex-row lg:justify-start gap-3 text-left">
                      <img src={m.team_b?.logo_url} className="w-12 h-12 lg:w-16 lg:h-16 object-contain" />
                      <span className="font-black text-lg lg:text-2xl uppercase italic tracking-tighter">{m.team_b?.name}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}