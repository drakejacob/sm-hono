//This is a component which simply counts upwards from the given time
import { FC } from "hono/jsx"

export const TimeCounter: FC<{ startDate?: Date }> = ({ startDate }) => {
	//startDate = new Date(2024, 3, 19, 13, 0)

	let elapsedMs = 0 * 1000

	if (startDate) {
		elapsedMs = Date.now() - startDate.getTime()
	}

	return (
		<span
			x-data={`{ elapsedMs: ${elapsedMs}, displayedTime: "0:00" }`}
			x-init={`
            const getDisplayedTime = (ms) => {
               const totalSeconds = Math.floor(ms / 1000)
               const seconds = totalSeconds % 60
               const minutes = Math.floor(totalSeconds / 60) % 60
               const hours = Math.floor(totalSeconds / 3600)

               const padded = (number) => number.toString().padStart(2, "0")

               if (hours > 0) {
                  return hours + ":" + padded(minutes) + ":" + padded(seconds)
               } else {
                  return minutes + ":" + padded(seconds)
               }
            }
            
            displayedTime = getDisplayedTime(new Date(elapsedMs))
            
            setInterval(() => {
               elapsedMs = new Date(elapsedMs).getTime() + 1000
               displayedTime = getDisplayedTime(new Date(elapsedMs))
            }, 1000)
         `}
			x-text="displayedTime"
		>
			timer not initialized
		</span>
	)
}
