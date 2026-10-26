import { useState } from 'react'
import RegistrarAdvertencia from './advertencias/RegistrarAdvertencia'
import ConsultarAdvertencia from './advertencias/ConsultarAdvertencia'

export default function Advertencias() {
  const [tab, setTab] = useState('registrar')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm w-fit">
        <button
          onClick={() => setTab('registrar')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'registrar'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          ➕ Registrar
        </button>
        <button
          onClick={() => setTab('consultar')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
            tab === 'consultar'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          🔍 Consultar / Editar
        </button>
      </div>

      {tab === 'registrar' ? <RegistrarAdvertencia /> : <ConsultarAdvertencia />}
    </div>
  )
}
