import { Store } from "$app"
import {
	getAllAgendaNodes,
	getCurrentAgendaPoint
} from "$app/pages/agenda/functions"
import { db } from "$db"
import { agendaNodes } from "$db/schema/meeting"
import { TimeCounter } from "./TimeCounter"
import { and, eq, isNotNull, isNull } from "drizzle-orm"
import { Context } from "hono"
import { FC } from "hono/jsx"

async function getAgendaPointParents(agendaNodeId: string, meetingId: string) {
	const allNodes = await getAllAgendaNodes(meetingId)

	function findParent(
		node: (typeof allNodes)[0],
		parents: typeof allNodes = []
	) {
		const parent = allNodes.find((n) => n.id === node.parentNodeId)

		if (parent) {
			parents.unshift(parent)
			return findParent(parent, parents)
		}

		return parents
	}

	const currentNode = allNodes.find((n) => n.id === agendaNodeId)

	if (!currentNode) {
		return []
	}

	return findParent(currentNode)
}

export const CurrentAgendaPoint: FC<{
	c: Context<{ Variables: Store }>
}> = async ({ c }) => {
	const currentMeetingId = c.get("activeMeetingId")
	if (!currentMeetingId) {
		return <div class="error">Meeting not found</div>
	}

	const currentAgendaPoint = await getCurrentAgendaPoint(currentMeetingId)
	if (!currentAgendaPoint) {
		return <div class="error">No active agenda point found</div>
	}

	const parents = await getAgendaPointParents(
		currentAgendaPoint.id,
		currentMeetingId
	)

	return (
		<div class="flex w-full flex-col items-center bg-slate-800 p-4">
			<span class="pb-2">Currently discussing</span>
			<p class="text-xs italic">
				{parents.map((node) => (
					<span>{node.name} &gt; </span>
				))}
			</p>

			<span class="text-2xl">{currentAgendaPoint.name}</span>

			<div class="absolute right-2 text-2xl font-bold">
				<TimeCounter></TimeCounter>
			</div>
		</div>
	)
}
