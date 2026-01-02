"use client"
import React, {useEffect, useState} from 'react'

function parseCSV(text){
  const lines = text.split(/\r?\n/).filter(Boolean)
  if(lines.length===0) return {headers:[],rows:[]}
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',')
    const obj = {}
    for(let i=0;i<headers.length;i++) obj[headers[i]] = (cols[i]||"").trim()
    return obj
  })
  return {headers,rows}
}

export default function ThesisFacultyViewer(){
  const [data,setData] = useState({headers:[],rows:[]})
  const [filter,setFilter] = useState('')

  useEffect(()=>{
    fetch('/ThesisFaculty.csv')
      .then(r=>r.text())
      .then(txt=>setData(parseCSV(txt)))
      .catch(()=>setData({headers:[],rows:[]}))
  },[])

  const filtered = data.rows.filter(r=>{
    if(!filter) return true
    const q = filter.toLowerCase()
    return Object.values(r).some(v=>String(v||'').toLowerCase().includes(q))
  })

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <input aria-label="Search" placeholder="Search name, email, accepting..." value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded px-2 py-1 flex-1" />
        <div className="text-sm text-gray-600">Total: {filtered.length}</div>
      </div>
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {data.headers.map((h,idx)=>(
                <th key={idx} className="text-left px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row,ri)=>(
              <tr key={ri} className={ri%2? 'bg-white':'bg-gray-100'}>
                {data.headers.map((h,ci)=>(
                  <td key={ci} className="px-3 py-2 align-top">{row[h]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
