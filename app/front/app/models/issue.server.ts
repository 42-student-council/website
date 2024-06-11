import { db } from "~/db.server";

export async function createIssue(data: {
	description: string;
	title: string
}) {
	return await db.issue.create({
		data: {
			description: data.description,
			title: data.title
		}
	});
}
