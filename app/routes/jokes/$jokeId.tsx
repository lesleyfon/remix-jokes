import { Joke } from "@prisma/client";
import { ActionArgs, LoaderArgs, V2_MetaFunction, json, redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import invariant from "tiny-invariant";
import {
	isRouteErrorResponse,
	Link,
	useLoaderData,
	useParams,
	useRouteError,
} from "@remix-run/react";
import { getUserId, requireUserId } from "~/utils/session.server";

export const action = async ({ params, request }: ActionArgs) => {
	const form = await request.formData();

	if (form.get("intent") !== "delete") {
		throw new Response(`The intent ${form.get("intent")} is not supported`, { status: 400 });
	}

	const userId = await requireUserId(request);
	const joke = await db.joke.findUnique({
		where: { id: params.jokeId },
	});

	if (!joke) {
		throw new Response("Can't delete what does not exist", {
			status: 404,
		});
	}

	if (joke.jokesterId !== userId) {
		throw new Response("Pssh, nice try. That's not your joke", { status: 403 });
	}

	await db.joke.delete({ where: { id: params.jokeId } });
	return redirect("/jokes");
};

type LoaderData = { joke: Joke | null; isOwner: boolean };

export const loader = async ({ params, request }: LoaderArgs) => {
	const userId = await getUserId(request);
	const { jokeId } = params;

	invariant(jokeId, `params.slug is required`);

	const joke = await db.joke.findUnique({
		where: {
			id: jokeId,
		},
	});

	if (!joke) {
		throw new Response("What a joke! Not found.", {
			status: 404,
		});
	}

	return json({
		isOwner: userId === joke.jokesterId,
		joke,
	});
};

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
	const { description, title } = data
		? {
				description: `Enjoy the "${data.joke.name}" joke and much more`,
				title: `"${data.joke.name}" joke`,
		  }
		: { description: "No joke found", title: "No joke" };

	return [
		{ name: "description", content: description },
		{ name: "twitter:description", content: description },
		{ title },
	];
};

export default function JokeRoute() {
	const { joke, isOwner } = useLoaderData<typeof loader>();

	invariant(joke, "Error, no Joke");

	return (
		<div>
			<p>{joke.content}</p>
			<Link to=".">{joke.name} Permalink</Link>
			{isOwner ? (
				<form method="post">
					<button className="button" name="intent" type="submit" value="delete">
						Delete
					</button>
				</form>
			) : null}
		</div>
	);
}

export function ErrorBoundary() {
	const { jokeId } = useParams();
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		if (error.status === 400) {
			return <div className="error-container">What you're trying to do is not allowed.</div>;
		}

		if (error.status === 403) {
			return <div className="error-container">Sorry, but "{jokeId}" is not your joke.</div>;
		}

		if (error.status === 404) {
			return <div className="error-container">Huh? What the heck is "{jokeId}"?</div>;
		}
	}
	return (
		<div className="error-container">
			There was an error loading joke by the id "${jokeId}". Sorry.
		</div>
	);
}
