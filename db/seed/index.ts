import { seedMeeting } from "./meeting"
import { seedSpeakers } from "./speakers"

export async function seedDatabase() {
	await seedSpeakers()

	await seedMeeting()
}
