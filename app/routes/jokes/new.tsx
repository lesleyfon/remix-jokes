import { ActionArgs, ActionFunction, FormData, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

const validateJokeName = (name: string) => {
	if (name.length < 3) {
		return "Joke name must be at least 3 chars or more";
	}
};

const validateJokeContent = (content: string) => {
	if (content.length < 10) {
		return "Joke name must be at least 3 chars or more";
	}
};

type formData = { name?: string; content?: string };
type ActionData = {
	formError?: string;
	fieldErrors?: formData;
	fields?: formData;
};
export const action: ActionFunction = async ({
	request,
}: ActionArgs): Promise<Response | ActionData> => {
	const formData = await request.formData();
	const userId = await requireUserId(request);
	const name = formData.get("name");
	const content = formData.get("content");

	if (typeof name !== "string" || typeof content !== "string") {
		return { formError: `Form not submitted correctly.` };
	}

	const fieldErrors = {
		name: validateJokeName(name),
		content: validateJokeContent(content),
	};

	if (Object.values(fieldErrors).some(Boolean)) {
		return { fieldErrors, fields: { name, content } };
	}

	const joke = await db.joke.create({
		data: { name, content, jokesterId: userId },
	});

	return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
	const actionData = useActionData<ActionData | undefined>();

	return (
		<div>
			<p>Add your own hilarious joke</p>
			<form method="post">
				<div>
					<label>
						Name:{" "}
						<input
							type="text"
							defaultValue={actionData?.fields?.name}
							name="name"
							aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
							aria-errormessage={
								actionData?.fieldErrors?.name ? "name-error" : undefined
							}
						/>
					</label>
					{actionData?.fieldErrors?.name && (
						<p className="form-validation-error" role="alert" id="name-error">
							{actionData.fieldErrors.name}
						</p>
					)}
				</div>
				<div>
					<label>
						Content:{" "}
						<textarea
							defaultValue={actionData?.fields?.content}
							name="content"
							aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
							aria-errormessage={
								actionData?.fieldErrors?.content ? "content-error" : undefined
							}
						/>
					</label>
					{actionData?.fieldErrors?.content && (
						<p className="form-validation-error" role="alert" id="content-error">
							{actionData.fieldErrors.content}
						</p>
					)}
				</div>
				<div>
					{actionData?.formError && (
						<p className="form-validation-error" role="alert">
							{actionData.formError}
						</p>
					)}
					<button type="submit" className="button">
						Add
					</button>
				</div>
			</form>
		</div>
	);
}
