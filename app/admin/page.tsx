"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  // Estados para datos de la DB
  const [teams, setTeams] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  
  // Estados para Crear Equipo
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamLogo, setNewTeamLogo] = useState('')
  
  // Estados para Crear Partido
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [kickoff, setKickoff] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: t } = await supabase.from('teams').select('*').order('name')
    // Traemos los partidos y los nombres de los equipos relacionados
    const { data: m } = await supabase.from('matches').select('*, team_a:team_a_id(name), team_b:team_b_id(name)').order('kickoff')
    setTeams(t || []); setMatches(m || [])
  }

  // FUNCIÓN: Crear nuevo equipo
  const createTeam = async () => {
    if(!newTeamName) return alert("El nombre del equipo es obligatorio")
    const { error } = await supabase.from('teams').insert({ 
      name: newTeamName, 
      logo_url: newTeamLogo 
    })
    
    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("🏆 Equipo '" + newTeamName + "' añadido correctamente")
      setNewTeamName(''); setNewTeamLogo('')
      fetchData()
    }
  }

  // FUNCIÓN: Crear nuevo partido
  const createMatch = async () => {
    if(!teamA || !teamB || !kickoff) return alert("Completa todos los campos del partido")
    if(teamA === teamB) return alert("Un equipo no puede jugar contra sí mismo")
    
    const { error } = await supabase.from('matches').insert({ 
      team_a_id: teamA, 
      team_b_id: teamB, 
      kickoff 
    })
    
    if (error) alert(error.message)
    else {
      alert("⚽ Partido programado")
      fetchData()
    }
  }

  // FUNCIÓN: Eliminar partido (Novedad)
  const deleteMatch = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este partido? Se borrarán también todas las predicciones asociadas.")) return
    
    const { error } = await supabase.from('matches').delete().eq('id', id)
    
    if (error) {
      alert("Error al eliminar: " + error.message)
    } else {
      fetchData() // Refrescamos la lista
    }
  }

  // FUNCIÓN: Guardar resultado real
  const updateScore = async (id: string, a: number, b: number) => {
    await supabase.from('matches').update({ score_a: a, score_b: b }).eq('id', id)
    alert("✅ Marcador oficial actualizado")
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10 font-mono selection:bg-red-500">
      <div className="max-w-5xl mx-auto">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center mb-10 border-b border-red-900/50 pb-6">
          <h1 className="text-2xl font-bold text-red-500 uppercase tracking-tighter">
            <span className="text-white opacity-50 mr-2">{'>'}</span>Admin_Control
          </h1>
          <Link href="/" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all">
            🔙 Ir a la Web
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10">
          
          {/* SECCIÓN 1: CREAR EQUIPO */}
          <section className="bg-gray-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-xs mb-6 opacity-40 uppercase tracking-[0.3em] font-black italic">Step_01: Register_Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder="Nombre (ej: España)" 
                className="bg-black p-4 rounded-xl border border-white/10 outline-none focus:border-white/40 transition-all text-sm"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="URL Logo (Wikipedia/PNG)" 
                className="bg-black p-4 rounded-xl border border-white/10 outline-none focus:border-white/40 transition-all text-sm"
                value={newTeamLogo}
                onChange={e => setNewTeamLogo(e.target.value)}
              />
              <button onClick={createTeam} className="bg-white text-black font-black rounded-xl uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all active:scale-95">
                Add_Team_To_DB
              </button>
            </div>
          </section>

          {/* SECCIÓN 2: CREAR PARTIDO */}
          <section className="bg-gray-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-xs mb-6 opacity-40 uppercase tracking-[0.3em] font-black italic">Step_02: Schedule_Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="bg-black p-4 rounded-xl border border-white/10 outline-none text-sm cursor-pointer" onChange={e => setTeamA(e.target.value)} value={teamA}>
                <option value="">Select Team A</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select className="bg-black p-4 rounded-xl border border-white/10 outline-none text-sm cursor-pointer" onChange={e => setTeamB(e.target.value)} value={teamB}>
                <option value="">Select Team B</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input type="datetime-local" className="bg-black p-4 rounded-xl border border-white/10 outline-none text-sm" onChange={e => setKickoff(e.target.value)} />
              <button onClick={createMatch} className="bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] transition-all active:scale-95">
                Create_Match
              </button>
            </div>
          </section>

          {/* SECCIÓN 3: RESULTADOS Y ELIMINACIÓN */}
          <section className="bg-gray-900/40 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-xs mb-6 opacity-40 uppercase tracking-[0.3em] font-black italic">Step_03: Manage_Matches</h2>
            
            <div className="space-y-4">
              {matches.map(m => (
                <div key={m.id} className="bg-black/40 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-white/5 hover:border-red-500/20 transition-all group">
                  <div className="text-center md:text-left flex-1">
                    <div className="text-[9px] text-red-500 font-black mb-1 opacity-60">
                      {new Date(m.kickoff).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })} HS
                    </div>
                    <span className="text-sm font-black uppercase italic tracking-tight">{m.team_a?.name} VS {m.team_b?.name}</span>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <input type="number" id={`a-${m.id}`} defaultValue={m.score_a} className="w-14 h-12 bg-black border border-white/10 text-center rounded-lg text-xl font-black outline-none focus:border-red-500 transition-all" />
                    <span className="opacity-20">-</span>
                    <input type="number" id={`b-${m.id}`} defaultValue={m.score_b} className="w-14 h-12 bg-black border border-white/10 text-center rounded-lg text-xl font-black outline-none focus:border-red-500 transition-all" />
                    
                    {/* Botón Guardar */}
                    <button 
                      onClick={() => {
                        const a = (document.getElementById(`a-${m.id}`) as HTMLInputElement).value
                        const b = (document.getElementById(`b-${m.id}`) as HTMLInputElement).value
                        if(a !== "" && b !== "") updateScore(m.id, parseInt(a), parseInt(b))
                        else alert("Pon ambos resultados")
                      }} 
                      className="bg-white/5 hover:bg-white/10 text-white px-4 h-12 rounded-lg text-[9px] font-black uppercase transition-all ml-2 border border-white/10"
                    >
                      Save
                    </button>

                    {/* BOTÓN ELIMINAR (Novedad) */}
                    <button 
                      onClick={() => deleteMatch(m.id)}
                      className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white w-12 h-12 rounded-lg flex items-center justify-center transition-all border border-red-600/20"
                      title="Eliminar partido"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÓN MAESTRO */}
            <div className="mt-10 pt-10 border-t border-white/5">
              <button 
                onClick={async () => { await supabase.rpc('update_all_leaderboards'); alert("🏆 ¡Ranking actualizado!") }} 
                className="w-full py-6 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black tracking-[0.3em] text-xs shadow-lg shadow-green-900/20 transition-all active:scale-95"
              >
                [ SYNC_LEADERBOARD_POINTS ]
              </button>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}