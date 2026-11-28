function formatearTiempoRelativo(isoStr) {
  if (!isoStr) return ''
  const fecha = new Date(isoStr)
  if (Number.isNaN(fecha.getTime())) return ''

  const ahora = new Date()
  const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const ayerInicio = new Date(hoyInicio)
  ayerInicio.setDate(hoyInicio.getDate() - 1)

  if (fecha >= hoyInicio) {
    return fecha.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (fecha >= ayerInicio) {
    return 'Ayer'
  }

  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  })
}


export function parsearNotificacion(textoRaw) {
  let texto = (textoRaw || '').trim()
  let cabecera = null
  let tipoCabecera = null
  let nombrePersona = ''
  let citaOriginal = null
  let fechaEtiqueta = ''
  let fechaCompleta = ''

  // Extraer [De: Nombre] o [Para: Nombre]
  const matchCabecera = texto.match(/^\[(De|Para):\s*(.+?)\]\n?([\s\S]*)$/)
  if (matchCabecera) {
    tipoCabecera = matchCabecera[1]
    nombrePersona = matchCabecera[2].trim()
    cabecera = `${tipoCabecera}: ${nombrePersona}`
    texto = matchCabecera[3].trim()
  }

  // Extraer marca de tiempo opcional [TS:2026-11-24T22:41:00]
  const matchTs = texto.match(/^\[TS:([^\]]+)\]\n?([\s\S]*)$/)
  if (matchTs) {
    const iso = matchTs[1].trim()
    fechaEtiqueta = formatearTiempoRelativo(iso)
    const d = new Date(iso)
    if (!Number.isNaN(d.getTime())) {
      fechaCompleta = d.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    }
    texto = matchTs[2].trim()
  }

  const matchCita = texto.match(/^\[En respuesta a:\s*"([\s\S]*?)"\]\n?([\s\S]*)$/)
  if (matchCita) {
    citaOriginal = matchCita[1].trim()
    texto = matchCita[2].trim()
  }

  return {
    cabecera,
    tipoCabecera,
    nombrePersona,
    citaOriginal,
    fechaEtiqueta,
    fechaCompleta,
    cuerpo: texto,
  }
}