//import * as meeting from "./schema/meeting"
import * as attendee from "./schema/attendee"
import * as meetings from "./schema/meeting"
import * as speakerslist from "./schema/speakerslist"
import { seedDatabase } from "./seed"
import { env } from "bun"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

const DATABASE_FILE_URL = "./sqlite/db.sqlite"

const sqlite = new Database(DATABASE_FILE_URL)
export const schema = { ...attendee, ...speakerslist, ...meetings }
export const db = drizzle(sqlite, { schema, logger: false })

console.log("ENV", env.ENV)

if (env.ENV?.toLowerCase() === "dev") {
	console.log("Environment is dev, seeding database file")
	seedDatabase()
}
