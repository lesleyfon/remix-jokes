import { ActionArgs, ActionFunction, FormData, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }: ActionArgs) => {
	const formData = await request.formData();

	const name = formData.get("name");
	const content = formData.get("content");

	if (typeof name !== "string" || typeof content !== "string") {
		throw new Error(`Form not submitted correctly.`);
	}

	const joke = await db.joke.create({
		data: { name, content },
	});

	return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
	return (
		<div>
			<p>Add your own hilarious joke</p>
			<form method="post">
				<div>
					<label>
						Name: <input type="text" name="name" />
					</label>
				</div>
				<div>
					<label>
						Content: <textarea name="content" />
					</label>
				</div>
				<div>
					<button type="submit" className="button">
						Add
					</button>
				</div>
			</form>
		</div>
	);
}
