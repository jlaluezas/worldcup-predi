"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('matches').select('*').order('kickoff').then(({ data }) => {
      setMatches(data || [])
      setLoading(false)
    })
  }, [])

  const save = async (mId: string, a: number, b: number) => {
    await supabase.from('matches').update({ score_a: a, score_b: b }).eq('id', mId)
    alert("Resultado oficial guardado")
  }

  const refresh = async () => {
    await supabase.rpc('update_all_leaderboards')
    alert("¡Puntos recalculados para todos!")
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-mono">LOADING_SYSTEM...</div>

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-8 selection:bg-green-500 selection:text-black">
      <div className="max-w-3xl mx-auto border border-green-900/30 p-10 rounded-3xl bg-gray-950 shadow-[0_0_100px_rgba(0,255,0,0.05)]">
        <div className="flex justify-between items-center mb-10 border-b border-green-900/30 pb-6">
          <h1 className="text-xl font-bold tracking-tighter uppercase">{'>'} Admin_Panel_v1.0</h1>
          <Link href="/" className="text-xs hover:underline">Exit_System</Link>
        </div>

        <button onClick={refresh} className="w-full mb-10 py-6 border-2 border-green-500 text-green-500 font-black hover:bg-green-500 hover:text-black transition-all rounded-2xl uppercase tracking-widest text-xs">
          [ RECALCULAR_PUNTOS_GLOBALES ]
        </button>

        <div className="space-y-6">
          {matches.map(m => (
            <div key={m.id} className="border border-green-900/20 p-6 rounded-2xl flex items-center justify-between bg-black/50">
              <div className="flex-1">
                <p className="text-[10px] opacity-40 mb-1">{m.kickoff}</p>
                <p className="text-sm font-bold uppercase">{m.team_a} vs {m.team_b}</p>
              </div>
              <div className="flex gap-4 items-center">
                <input type="number" id={`a-${m.id}`} defaultValue={m.score_a} className="w-12 h-12 bg-green-900/10 border border-green-900/30 text-center rounded-xl focus:border-green-500 outline-none" />
                <span className="opacity-30">-</span>
                <input type="number" id={`b-${m.id}`} defaultValue={m.score_b} className="w-12 h-12 bg-green-900/10 border border-green-900/30 text-center rounded-xl focus:border-green-500 outline-none" />
                <button onClick={() => {
                  const a = (document.getElementById(`a-${m.id}`) as HTMLInputElement).value
                  const b = (document.getElementById(`b-${m.id}`) as HTMLInputElement).value
                  save(m.id, parseInt(a), parseInt(b))
                }} className="ml-4 bg-green-500 text-black px-4 py-3 rounded-xl text-[10px] font-black uppercase">Update</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}