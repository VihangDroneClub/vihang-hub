export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || !rows.length) return

  const separator = ','
  const keys = Object.keys(rows[0])
  
  const csvContent = [
    keys.join(separator),
    ...rows.map(row => 
      keys.map(key => {
        let cell = row[key] === null || row[key] === undefined ? '' : row[key]
        
        // Handle Objects (like old_value/new_value JSONB)
        if (typeof cell === 'object') {
          cell = JSON.stringify(cell)
        }
        
        let cellValue = String(cell).replace(/"/g, '""')
        if (cellValue.search(/("|,|\n)/g) >= 0) {
          cellValue = `"${cellValue}"`
        }
        return cellValue
      }).join(separator)
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
