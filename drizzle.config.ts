import type { Config } from "drizzle-kit"
export default {
	schema: "./db/schema",
	out: "./drizzle",
	driver: "libsql",
	dbCredentials: {
		url: "file:./sqlite/db.sqlite"
	}
} satisfies Config
