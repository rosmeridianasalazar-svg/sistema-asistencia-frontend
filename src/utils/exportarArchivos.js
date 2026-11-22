import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const LOGO_NEXOS_URL = 'https://i.postimg.cc/NGkbyD4C/nexos2-0.png'

function cargarImagenBase64(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        ratio: img.width / img.height,
      })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

export function descargarCSV(nombreArchivo, columnas, filas) {
  const encabezados = columnas.map((c) => `"${c.titulo}"`).join(',')
  const lineas = filas.map((fila) =>
    columnas
      .map((c) => {
        const valor = fila[c.campo] ?? ''
        return `"${String(valor).replace(/"/g, '""')}"`
      })
      .join(','),
  )

  const contenido = '\uFEFF' + [encabezados, ...lineas].join('\n')
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${nombreArchivo}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export async function descargarPDF({
  nombreArchivo,
  titulo,
  subtitulo = '',
  columnas,
  filas,
  orientacion = 'portrait',
}) {
  const doc = new jsPDF({ orientation: orientacion, unit: 'mm', format: 'a4' })
  const anchoPagina = doc.internal.pageSize.getWidth()
  const fechaEmision = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  doc.setFillColor(17, 17, 17)
  doc.rect(0, 0, anchoPagina, 24, 'F')

  doc.setFillColor(242, 105, 13)
  doc.rect(0, 24, anchoPagina, 1.5, 'F')

  const logo = await cargarImagenBase64(LOGO_NEXOS_URL)
  let margenTextoIzquierdo = 14

  if (logo) {
    const altoLogo = 15
    const anchoLogo = altoLogo * logo.ratio
    doc.addImage(logo.dataUrl, 'PNG', 14, 4.5, anchoLogo, altoLogo)
    margenTextoIzquierdo = 14 + anchoLogo + 5
  }

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('NEXOS TIENDAS S.A.C.', margenTextoIzquierdo, 11)

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal')
  doc.text(titulo, margenTextoIzquierdo, 17.5)

  doc.setFontSize(8)
  doc.text(`Emitido: ${fechaEmision}`, anchoPagina - 14, 15, { align: 'right' })

  if (subtitulo) {
    doc.setTextColor(90, 90, 90)
    doc.setFontSize(9)
    doc.text(subtitulo, 14, 32)
  }

  autoTable(doc, {
    startY: subtitulo ? 36 : 31,
    head: [columnas.map((c) => c.titulo)],
    body: filas.map((fila) => columnas.map((c) => fila[c.campo] ?? '—')),
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: [224, 224, 224],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [242, 105, 13],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 14, right: 14 },
  })

  doc.save(`${nombreArchivo}.pdf`)
}