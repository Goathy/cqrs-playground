import Postgrator from 'postgrator'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { sql } from '@databases/sqlite'

/**
 * @param {import('@databases/sqlite').DatabaseConnection} conn
 * @returns {Promise<void>}
 */
export async function prepare (conn) {
  const migrator = new Postgrator({
    driver: 'sqlite3',
    schemaTable: 'migration',
    validateChecksums: true,
    migrationPattern: join(cwd(), 'migrations', '*'),
    execQuery: async (query) => {
      const results = await conn.query(sql.__dangerous__rawValue(query))
      return { rows: results }
    }
  }
  )

  await migrator.migrate()
}
