import { useState } from 'react'
import { useShares, addShare, deleteShare } from '../lib/data.js'
import { useAuth } from '../lib/auth.jsx'
import { useToast } from '../components/ui.jsx'

const STATUS = ['posted', 'planned']

function today() {
  const d = new Date()
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function Outreach() {
  const { rows, loading } = useShares()
  const { session } = useAuth()
  const toast = useToast()

  const [channel, setChannel] = useState('')
  const [where, setWhere] = useState('')
  const [reach, setReach] = useState('')
  const [status, setStatus] = useState('posted')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const posted = rows.filter((r) => r.status === 'posted').length

  async function add(e) {
    e.preventDefault()
    if (!channel.trim()) return
    setBusy(true)
    try {
      await addShare({
        channel: channel.trim(), target: where.trim(), reach: reach.trim(),
        status, note: note.trim(),
        posted_by: (session?.user?.email || '').split('@')[0],
        posted_on: today(),
      })
      setChannel(''); setWhere(''); setReach(''); setNote(''); setStatus('posted')
      toast('Added')
    } catch (e) { toast(e.message || 'Could not add') } finally { setBusy(false) }
  }

  async function remove(id) {
    try { await deleteShare(id); toast('Removed') } catch { toast('Could not remove') }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div>
        <div className="eyebrow">Distribution</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 6px' }}>
          Where we shared the survey
        </h1>
        <p className="lede">A running log so we do not double-post and can show the partners our reach. Add a row each time anyone sends the survey somewhere.</p>
      </div>

      <div className="card">
        <div className="hd"><h2>Log a share</h2><span className="note">{posted} posted</span></div>
        <form className="bd" onSubmit={add} style={{ display: 'grid', gap: 12 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <div className="field">
              <label htmlFor="ch">Channel</label>
              <input id="ch" className="inp" value={channel} placeholder="Reddit, IG story, group chat…" onChange={(e) => setChannel(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="wh">Where exactly <span className="hint">(sub, group, link)</span></label>
              <input id="wh" className="inp" value={where} placeholder="r/SampleSize, CS class gc…" onChange={(e) => setWhere(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="re">Est. reach <span className="hint">(optional)</span></label>
              <input id="re" className="inp" value={reach} placeholder="~40 people" onChange={(e) => setReach(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="st">Status</label>
              <select id="st" className="inp" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="nt">Note <span className="hint">(optional)</span></label>
            <input id="nt" className="inp" value={note} placeholder="removed by mods / got 12 responses / repost next week…" onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="row">
            <button className="btn" type="submit" disabled={busy || !channel.trim()}>{busy ? 'Adding…' : 'Add to log'}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="hd"><h2>Shared so far</h2><span className="note">{rows.length} entries</span></div>
        {loading ? (
          <div className="empty"><span className="spin" /></div>
        ) : rows.length === 0 ? (
          <div className="empty">Nothing logged yet. Add your first share above.</div>
        ) : (
          <div className="tablewrap">
            <table>
              <thead>
                <tr><th>Channel</th><th>Where</th><th>Reach</th><th>By</th><th>Date</th><th>Status</th><th>Note</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ cursor: 'default' }}>
                    <td><strong>{r.channel}</strong></td>
                    <td>{r.target || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.reach || '—'}</td>
                    <td>{r.posted_by || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{r.posted_on || '—'}</td>
                    <td><span className={'tag s-' + (r.status === 'posted' ? 'done' : 'logged')}>{r.status || 'posted'}</span></td>
                    <td style={{ color: 'var(--muted)' }}>{r.note || ''}</td>
                    <td><button className="btn danger sm" onClick={() => remove(r.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
