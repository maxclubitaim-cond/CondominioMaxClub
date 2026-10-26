import { useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { supabase } from '../../lib/supabase'

export default function ConsultarAdvertencia() {
  const [unidade, setUnidade] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [exportingId, setExportingId] = useState(null)
  const [editing, setEditing] = useState(null) // { id, dados }
  const [savingEdit, setSavingEdit] = useState(false)

  const buscar = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setSearched(true)
    const { data, error } = await supabase
      .from('advertencias')
      .select('*')
      .ilike('unidade', `%${unidade.trim()}%`)
      .order('data_infracao', { ascending: false })
    setResultados(error ? [] : data || [])
    setLoading(false)
  }

  const abrirEdicao = (adv) => {
    setEditing({
      id: adv.id,
      unidade: adv.unidade,
      data_infracao: adv.data_infracao,
      hora_infracao: adv.hora_infracao?.slice(0, 5) || '',
      infracao: adv.infracao,
      regimento_interno: adv.regimento_interno || '',
      reincidente: adv.reincidente,
      multa: adv.multa ?? '',
    })
  }

  const salvarEdicao = async () => {
    setSavingEdit(true)
    const { error } = await supabase
      .from('advertencias')
      .update({
        unidade: editing.unidade,
        data_infracao: editing.data_infracao,
        hora_infracao: editing.hora_infracao,
        infracao: editing.infracao,
        regimento_interno: editing.regimento_interno,
        reincidente: editing.reincidente,
        multa: editing.reincidente && editing.multa ? Number(editing.multa) : null,
      })
      .eq('id', editing.id)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      setResultados(prev => prev.map(r => r.id === editing.id ? { ...r, ...editing, multa: editing.reincidente ? Number(editing.multa) : null } : r))
      setEditing(null)
    }
    setSavingEdit(false)
  }

  const excluir = async (id) => {
    if (!confirm('Excluir esta advertência? Essa ação não pode ser desfeita.')) return
    const { error } = await supabase.from('advertencias').delete().eq('id', id)
    if (!error) setResultados(prev => prev.filter(r => r.id !== id))
  }

  const exportar = async (adv) => {
    setExportingId(adv.id)
    try {
      const zip = new JSZip()
      zip.file('advertencia.txt', buildTxt(adv))
      const folder = zip.folder('evidencias')
      for (const ev of adv.evidencias || []) {
        try {
          const res = await fetch(ev.url)
          if (!res.ok) continue
          folder.file(ev.name, await res.blob())
        } catch (err) {
          console.error('Falha ao baixar evidência:', ev.name, err)
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, buildZipName(adv))
    } catch (err) {
      alert('Erro ao exportar: ' + err.message)
    } finally {
      setExportingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Consultar Advertência</h2>
        <form onSubmit={buscar} className="flex gap-3 flex-wrap">
          <input value={unidade} onChange={(e) => setUnidade(e.target.value)} className="input flex-1 min-w-[200px]" placeholder="Digite a unidade (ex: Bloco A - Apto 101)" />
          <button type="submit" disabled={loading || !unidade.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {searched && !loading && resultados.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          Nenhuma advertência encontrada para "{unidade}".
        </div>
      )}

      {resultados.map((adv) => {
        const isEditing = editing?.id === adv.id
        return (
          <div key={adv.id} className="bg-white rounded-xl shadow p-6 space-y-4">
            {!isEditing ? (
              <>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{adv.unidade}</h3>
                    <p className="text-sm text-gray-500">{formatDate(adv.data_infracao)} às {adv.hora_infracao?.slice(0,5)}</p>
                  </div>
                  {adv.reincidente && (
                    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">REINCIDENTE</span>
                  )}
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <Info label="Infração" value={adv.infracao} />
                  <Info label="Regimento Interno" value={adv.regimento_interno || '—'} />
                  <Info label="Multa" value={adv.multa ? `R$ ${Number(adv.multa).toFixed(2)}` : '—'} />
                  <Info label="Registrada em" value={new Date(adv.created_at).toLocaleString('pt-BR')} />
                </dl>

                {adv.evidencias?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Evidências ({adv.evidencias.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {adv.evidencias.map((ev, i) => (
                        <a key={i} href={ev.url} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden hover:shadow transition">
                          {ev.type?.startsWith('image/') ? (
                            <img src={ev.url} alt={ev.name} className="w-full h-32 object-cover" />
                          ) : (
                            <div className="h-32 flex items-center justify-center bg-gray-50 text-4xl">📄</div>
                          )}
                          <p className="text-xs px-2 py-1 truncate text-gray-600">{ev.name}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => abrirEdicao(adv)} className="flex-1 min-w-[120px] bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-lg transition">✏️ Editar</button>
                  <button onClick={() => excluir(adv.id)} className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition">🗑️ Excluir</button>
                  <button onClick={() => exportar(adv)} disabled={exportingId === adv.id} className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition">
                    {exportingId === adv.id ? 'Gerando...' : '📦 Exportar ZIP'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Editar advertência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Unidade"><input value={editing.unidade} onChange={(e) => setEditing({...editing, unidade: e.target.value})} className="input" /></Field>
                  <Field label="Data"><input type="date" value={editing.data_infracao} onChange={(e) => setEditing({...editing, data_infracao: e.target.value})} className="input" /></Field>
                  <Field label="Hora"><input type="time" value={editing.hora_infracao} onChange={(e) => setEditing({...editing, hora_infracao: e.target.value})} className="input" /></Field>
                  <Field label="Infração"><input value={editing.infracao} onChange={(e) => setEditing({...editing, infracao: e.target.value})} className="input" /></Field>
                </div>
                <Field label="Regimento Interno"><textarea rows={2} value={editing.regimento_interno} onChange={(e) => setEditing({...editing, regimento_interno: e.target.value})} className="input" /></Field>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input type="checkbox" id={`reinc-${adv.id}`} checked={editing.reincidente} onChange={(e) => setEditing({...editing, reincidente: e.target.checked})} className="w-5 h-5 accent-indigo-600" />
                  <label htmlFor={`reinc-${adv.id}`} className="font-medium text-gray-800">Reincidente</label>
                </div>
                {editing.reincidente && (
                  <Field label="Multa (R$)"><input type="number" step="0.01" min="0" value={editing.multa} onChange={(e) => setEditing({...editing, multa: e.target.value})} className="input" /></Field>
                )}
                <div className="flex gap-2">
                  <button onClick={salvarEdicao} disabled={savingEdit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition">{savingEdit ? 'Salvando...' : 'Salvar'}</button>
                  <button onClick={() => setEditing(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-lg transition">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, children }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>
}
function Info({ label, value }) {
  return <div><dt className="text-gray-500 text-xs uppercase font-medium">{label}</dt><dd className="text-gray-900">{value}</dd></div>
}
function formatDate(d) { if (!d) return ''; const [y,m,day] = d.split('-'); return `${day}/${m}/${y}` }
function buildZipName(adv) {
  const date = (adv.data_infracao || '').replaceAll('-', '') || 'SEMDATA'
  const time = (adv.hora_infracao || '').slice(0, 5).replace(':', '') || 'SEMHORA'
  const unidade = (adv.unidade || 'UNIDADE').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_').toUpperCase()
  return `${unidade}-${date}-${time}.zip`
}
function buildTxt(adv) {
  return [
    '===================================',
    '       REGISTRO DE ADVERTÊNCIA',
    '===================================',
    '',
    `Unidade:            ${adv.unidade}`,
    `Data da Infração:   ${formatDate(adv.data_infracao)}`,
    `Hora da Infração:   ${adv.hora_infracao?.slice(0,5)}`,
    `Infração:           ${adv.infracao}`,
    `Regimento Interno:  ${adv.regimento_interno || '—'}`,
    `Reincidente:        ${adv.reincidente ? 'SIM' : 'NÃO'}`,
    `Multa:              ${adv.multa ? `R$ ${Number(adv.multa).toFixed(2)}` : '—'}`,
    '',
    `Registrada em:      ${new Date(adv.created_at).toLocaleString('pt-BR')}`,
    `ID:                 ${adv.id}`,
    '',
    '---------- EVIDÊNCIAS ----------',
    ...(adv.evidencias?.length ? adv.evidencias.map((ev, i) => `${i + 1}. ${ev.name}  (${ev.url})`) : ['Nenhuma evidência anexada.']),
    '',
    '===================================',
  ].join('\r\n')
}
