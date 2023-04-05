import { db } from "~/utils/db.server";
import { Joke } from "@prisma/client";
import invariant from "tiny-invariant";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = async () => {
	const count = await db.joke.count();

	const randomRowNumber = Math.floor(Math.random() * count);
	const randomJoke = await db.joke.findMany({
		take: 1,
		skip: randomRowNumber,
	});

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
