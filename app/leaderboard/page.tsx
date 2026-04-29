"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.from('profiles').select('*').order('points', { ascending: false }).then(({ data }) => {
      setProfiles(data || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <main className="min-h-screen bg-[#0f172a] text-white pb-20 pt-10">
      <div className="max-w-xl mx-auto px-4">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent uppercase text-center w-full">Clasificación</h1>
        </header>

        <nav className="flex glass p-1 rounded-2xl mb-10">
          <button onClick={() => router.push('/')} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Partidos</button>
          <button className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-white/10 rounded-xl shadow-xl">Ranking</button>
        </nav>

        <div className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
                <th className="px-6 py-5 text-center w-20">#</th>
                <th className="px-6 py-5 text-left">Jugador</th>
                <th className="px-6 py-5 text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles.map((p, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-6 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-600 text-black' : 'text-gray-500'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-bold text-sm tracking-tight">{p.username || 'Anonimo'}</td>
                  <td className="px-6 py-6 text-right font-black text-yellow-500 text-lg italic">{p.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}