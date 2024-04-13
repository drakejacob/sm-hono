import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
//import * as meeting from "./schema/meeting"
import * as attendee from "./schema/attendee"
import * as speakerslist from "./schema/speakerslist"
import { env } from "bun"
import { seedDatabase } from "./seed"

const DATABASE_FILE_URL = "./sqlite/db.sqlite"

const sqlite = new Database(DATABASE_FILE_URL)
export const schema = { ...attendee, ...speakerslist }
export const db = drizzle(sqlite, { schema, logger: false })

console.log("ENV", env.ENV)

if (env.ENV?.toLowerCase() === "dev") {
	console.log("Environment is dev, seeding database file")
	seedDatabase()
}
