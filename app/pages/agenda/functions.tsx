import { db, schema } from "$db"
import { AgendaNode, agendaNodes } from "$db/schema/meeting"
import { and, eq, isNotNull, isNull } from "drizzle-orm"

type WithChildren<T> = T & { children: WithChildren<T>[] }

type AgendaNodeWithChildren = WithChildren<AgendaNode>

export async function getAllAgendaNodes(
	meetingId: string
): Promise<AgendaNodeWithChildren[]> {
	const meeting = await db.query.meetings.findFirst({
		where: eq(schema.meetings.id, meetingId),
		with: {
			agendaNodes: true
		}
	})

	if (!meeting) {
		return []
	}

	const allNodes: AgendaNodeWithChildren[] = meeting.agendaNodes.map(
		(node) => ({
			...node,
			children: []
		})
	)

	const allNodesSorted = allNodes.toSorted(
		(a, b) => a.orderInParent - b.orderInParent
	)

	allNodesSorted.map((node) => {
		if (node.parentNodeId) {
			const parent = allNodes.find((n) => n.id === node.parentNodeId)
			if (parent) {
				parent.children.push(node)
			}
		}
	})

	return allNodesSorted
}

export async function getCurrentAgendaPoint(meetingId: string) {
	const currentAgendaPoint = await db.query.agendaNodes.findFirst({
		where: and(
			eq(agendaNodes.meetingId, meetingId),
			isNotNull(agendaNodes.startedAt),
			isNull(agendaNodes.endedAt)
		)
	})

	return currentAgendaPoint ?? null
}

export async function getJsxFromAgendaNodes(
	agendaNodes: AgendaNodeWithChildren[]
) {
	const rootNodes = agendaNodes.filter((node) => !node.parentNodeId)

	function jsxFromNodes(nodes: AgendaNodeWithChildren[]) {
		return (
			<ol class="flex flex-col gap-[0.4em] pl-8 text-[0.85em]">
				{nodes.map((node) => (
					<li>
						{node.name}
						{jsxFromNodes(node.children)}
					</li>
				))}
			</ol>
		)
	}

	return <div class="text-[2rem]">{jsxFromNodes(rootNodes)}</div>
}
