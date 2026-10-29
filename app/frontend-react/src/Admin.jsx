import { useEffect, useState } from 'react'

const fmt = (t) => (t ? new Date(t * 1000).toLocaleString() : '-')
const risk = (w) =>
  w === 0 ? ['Clean', '#14532d', '#bbf7d0']
  : w < 3 ? ['Suspicious', '#78350f', '#fde68a']
  : ['High risk', '#7f1d1d', '#fecaca']

export default function Admin() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(null)

  const load = () =>
    fetch('/api/admin/sessions').then((r) => r.json()).then(setRows)

  useEffect(() => { load() }, [])

  const th = { textAlign: 'left', padding: '10px 8px', color: '#94a3b8', borderBottom: '1px solid #334155' }
  const td = { padding: '10px 8px', borderBottom: '1px solid #334155' }

  return (
    <div className="card">
      <h1>Admin <span>Report</span></h1>
      <p className="sub">All exam sessions and proctoring events</p>
      <button className="ghost" onClick={load}>Refresh</button>

      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Category</th>
              <th style={th}>Score</th>
              <th style={th}>Warnings</th>
              <th style={th}>Risk</th>
              <th style={th}>Started</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const [label, bg, fg] = risk(r.warnings)
              return (
                <>
                  <tr key={r.session_id} onClick={() => setOpen(open === r.session_id ? null : r.session_id)} style={{ cursor: 'pointer' }}>
                    <td style={td}>{r.name}</td>
                    <td style={td}>{(r.category || '').replaceAll('_', ' ')}</td>
                    <td style={td}>{r.submitted ? `${r.score}/${r.total}` : 'In progress'}</td>
                    <td style={td}>{r.warnings}</td>
                    <td style={td}>
                      <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 8, fontWeight: 600, fontSize: 12 }}>{label}</span>
                    </td>
                    <td style={td}>{fmt(r.started_at)}</td>
                  </tr>
                  {open === r.session_id && (
                    <tr key={r.session_id + '-events'}>
                      <td colSpan={6} style={{ ...td, background: '#0f172a' }}>
                        {r.events.length === 0 && <i>No events recorded</i>}
                        {r.events.map((e, i) => (
                          <div key={i} style={{ padding: '3px 0' }}>
                            <b>{e.type.replaceAll('_', ' ')}</b> at {fmt(e.timestamp)}
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="sub" style={{ marginTop: 16 }}>No sessions yet.</p>}
      </div>
    </div>
  )
}