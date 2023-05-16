import { ActionArgs, ActionFunction, FormData, LoaderArgs, redirect, json } from "@remix-run/node";
import {
	isRouteErrorResponse,
	Link,
	useActionData,
	useNavigation,
	useRouteError,
} from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { JokeDisplay } from "~/components/joke";

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

export const loader = async ({ request }: LoaderArgs) => {
	const userId = await getUserId(request);
	if (!userId) {
		throw new Response("Unauthorized", { status: 401 });
	}
	return json({});
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

	const navigation = useNavigation();

	if (navigation.formData) {
		const content = navigation.formData.get("content");
		const name = navigation.formData.get("name");
		if (
			typeof content === "string" &&
			typeof name === "string" &&
			!validateJokeContent(content) &&
			!validateJokeName(name)
		) {
			return <JokeDisplay canDelete={false} isOwner={true} joke={{ name, content }} />;
		}
	}

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

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error) && error.status === 401) {
		return (
			<div className="error-container">
				<p>You must be logged in to create a joke.</p>
				<Link to="/login">Login</Link>
			</div>
		);
	}

	return (
		<div className="error-container">Something unexpected went wrong. Sorry about that.</div>
	);
}
