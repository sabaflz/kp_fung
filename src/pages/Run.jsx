import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUILTIN_SETS } from '../data/pool.js'
import { useSets, useQuestions } from '../lib/data.js'
import { useToast, copyText } from '../components/ui.jsx'

export default function Run() {
  const { rows: saved } = useSets()
  const { rows: qrows } = useQuestions()
  const toast = useToast()
  const nav = useNavigate()

  const byId = Object.fromEntries(qrows.map((q) => [q[0], q]))
  const allSets = [...BUILTIN_SETS, ...saved]
  const [setId, setSetId] = useState(BUILTIN_SETS[0].id)
  const [asked, setAsked] = useState({})

  const active = allSets.find((s) => s.id === setId) || BUILTIN_SETS[0]
  const questions = (active.question_ids || []).map((id) => byId[id]).filter(Boolean)
  const done = questions.filter((q) => asked[q[0]]).length
  const pct = questions.length ? Math.round((done / questions.length) * 100) : 0

  function pick(id) { setSetId(id); setAsked({}) }
  function toggle(id) { setAsked((a) => ({ ...a, [id]: !a[id] })) }

  async function copyScript() {
    const text = `${active.name}\n\n` + questions.map((q, i) => `${i + 1}. ${q[2]}`).join('\n\n')
    toast((await copyText(text)) ? 'Script copied' : 'Copy failed')
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Live interview</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Run an interview
        </h1>
        <p className="lede">Pick a set, then work down the list while they talk. Tick each question as you ask it. Do not pitch, do not explain the benefit, let them lead.</p>
      </div>

      <div className="card">
        <div className="hd"><h2>Choose a set</h2><span className="note">{allSets.length} available</span></div>
        <div className="bd">
          <div className="row">
            {allSets.map((s) => (
              <button key={s.id} className={'chip' + (s.id === setId ? ' on' : '')} onClick={() => pick(s.id)}>
                {s.name}
                <span className="ct">{(s.question_ids || []).length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="hd">
          <h2>{active.name}</h2>
          <span className="note">{done} / {questions.length} asked</span>
        </div>
        <div className="bd" style={{ display: 'grid', gap: 16 }}>
          {active.note && <div className="notice">{active.note}</div>}

          <div className="bar" style={{ gridTemplateColumns: '1fr auto' }}>
            <div className="track" style={{ gridColumn: '1 / -1' }}>
              <div className="fill" style={{ width: pct + '%' }} />
            </div>
          </div>

          <div className="row">
            <button className="btn ghost sm" onClick={copyScript}>Copy script</button>
            <button className="btn ghost sm" onClick={() => setAsked({})}>Reset ticks</button>
            <button className="btn sm" onClick={() => nav('/interviews')}>Log this interview &rarr;</button>
          </div>

          <ol className="qlist">
            {questions.map((q) => (
              <li key={q[0]} onClick={() => toggle(q[0])} style={{ cursor: 'pointer', opacity: asked[q[0]] ? 0.5 : 1 }}>
                <div>
                  <span className="grp">{q[1]}</span>
                  <span className="qt" style={{ textDecoration: asked[q[0]] ? 'line-through' : 'none' }}>{q[2]}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
