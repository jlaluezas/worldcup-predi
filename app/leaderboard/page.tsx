"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Leaderboard() {
  const [user, setUser] = useState<any>(null)
  const [myProfile, setMyProfile] = useState<any>(null) // Para la barra lateral
  const [allProfiles, setAllProfiles] = useState<any[]>([]) // Para el ranking
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Traer datos del usuario actual (Sidebar)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setMyProfile(p)

      // Traer a todos los usuarios para el ranking
      const { data: all } = await supabase.from('profiles').select('*').order('points', { ascending: false })
      setAllProfiles(all || [])
      
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <main className="min-h-screen bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* --- SIDEBAR --- */}
          <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-10">
            {/* Perfil Miniatura */}
            <div className="glass p-6 rounded-[2.5rem] border-white/5 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-4">
                <img 
                  src={myProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myProfile?.id}`} 
                  className="w-16 h-16 rounded-full border-2 border-yellow-500 p-0.5 bg-black/20"
                  alt="avatar"
                />
                <div>
                  <h2 className="font-black text-lg tracking-tighter truncate w-32 uppercase italic">{myProfile?.username || 'Sin Apodo'}</h2>
                  <p className="text-yellow-500 text-xs font-black tracking-widest">{myProfile?.points || 0} PTS</p>
                </div>
              </div>
            </div>

            {/* Menú */}
            <nav className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4 mb-2">Menú</p>
              <button onClick={() => router.push('/')} className="w-full flex items-center gap-4 px-6 py-4 glass text-gray-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                <span>⚽</span> Partidos
              </button>
              <button className="w-full flex items-center gap-4 px-6 py-4 bg-yellow-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-yellow-500/20">
                <span>🏆</span> Clasificación
              </button>
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full flex items-center gap-4 px-6 py-4 text-red-400/60 hover:text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                <span>🚪</span> Salir
              </button>
            </nav>
          </aside>

          {/* --- CONTENIDO PRINCIPAL: RANKING --- */}
          <div className="lg:col-span-3 space-y-6">
            <div className="mb-8">
              <h2 className="text-4xl font-black italic tracking-tighter uppercase text-yellow-500">Global Ranking</h2>
              <p className="text-white/50 text-xs font-bold tracking-widest uppercase mt-1">Los mejores pronosticadores</p>
            </div>

            <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/40 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    <th className="px-8 py-6 text-center w-24">Pos</th>
                    <th className="px-8 py-6 text-left">Jugador</th>
                    <th className="px-8 py-6 text-right w-32">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allProfiles.map((p, i) => (
                    <tr key={i} className={`transition-colors ${p.id === user?.id ? 'bg-white/10' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm shadow-lg ${i === 0 ? 'bg-yellow-500 text-black shadow-yellow-500/50' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'glass text-gray-400'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} 
                            className="w-10 h-10 rounded-full bg-black/20"
                            alt="avatar"
                          />
                          <span className="font-bold text-lg tracking-tight uppercase italic">{p.username || 'Anonimo'}</span>
                          {p.id === user?.id && <span className="text-[9px] bg-yellow-500 text-black px-2 py-1 rounded-full font-black tracking-widest uppercase ml-2">TÚ</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-yellow-500 text-2xl italic">{p.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allProfiles.length === 0 && <div className="p-10 text-center text-gray-500 uppercase font-bold tracking-widest text-xs">No hay jugadores todavía</div>}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}