import fs from "node:fs/promises"
import path from "node:path"

type MythFact = { myth: string; fact: string }

function parseCSV(content: string): MythFact[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const dataLines = lines.slice(1)
  const rows: MythFact[] = []
  for (const line of dataLines) {
    const fields: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim())
        current = ""
      } else {
        current += ch
      }
    }
    fields.push(current.trim())
    if (fields.length >= 2) {
      const myth = fields[0].replace(/^"|"$/g, "").trim()
      const fact = fields[1].replace(/^"|"$/g, "").trim()
      rows.push({ myth, fact })
    }
  }
  return rows
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "docs", "myth", "sti_myths_facts.csv")
    const csv = await fs.readFile(filePath, "utf8")
    const parsed = parseCSV(csv)
    const data = parsed.map((row, idx) => ({ id: String(idx + 1), myth: row.myth, fact: row.fact }))
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    })
  } catch (e) {
    return new Response(JSON.stringify([]), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  }
}

