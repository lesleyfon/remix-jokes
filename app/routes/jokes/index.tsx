import { db } from "~/utils/db.server";
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from "@remix-run/react";

export const loader = async () => {
	const count = await db.joke.count();

	const randomRowNumber = Math.floor(Math.random() * count);
	const randomJoke = await db.joke.findMany({
		take: 1,
		skip: randomRowNumber,
	});
	if (!randomJoke) {
		throw new Response("No random joke found", {
			status: 404,
		});
	}

	return { joke: randomJoke[0] };
};
export default function JokesIndexRoute() {
	const { joke } = useLoaderData<typeof loader>();
	return (
		<div>
			<p>Here's a random joke:</p>
			<p>{joke.content}</p>
			<Link to=".">{joke.name} Permalink</Link>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error) && error.status === 404) {
		return (
			<div className="error-container">
				<p>There are no jokes to display.</p>
				<Link to="new">Add your own</Link>
			</div>
		);
	}

	return <div className="error-container">I did a whoopsies.</div>;
}
