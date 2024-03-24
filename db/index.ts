import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
import * as meeting from "./schema/meeting"

const sqlite = new Database("/sqlite/db.sqlite")
export const schema = { ...meeting }
export const db = drizzle(sqlite, { schema, logger: true })

const result = await db.select().from(schema.meetingAgendaGroups)

export const idFunction = "(hex(randomblob(8)))"

// import { drizzle } from "drizzle-orm/libsql"
// import { createClient } from "@libsql/client"
