import { Joke } from "@prisma/client";
import { LoaderArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";
import invariant from "tiny-invariant";
import { Link, useLoaderData } from "@remix-run/react";

type LoaderData = { joke: Joke | null };
export const loader = async ({ params }: LoaderArgs) => {
	const { jokeId } = params;

	invariant(jokeId, `params.slug is required`);

	const data: LoaderData = {
		joke: await db.joke.findUnique({
			where: {
				id: jokeId,
			},
		}),
	};
	if (!data.joke) {
		throw new Error("Joke not found");
	}

	return data;
};

export default function JokeRoute() {
	const { joke } = useLoaderData<typeof loader>();

	invariant(joke, "Error, no Joke");

	return (
		<div>
			<p>{joke.content}</p>
			<Link to=".">{joke.name} Permalink</Link>
		</div>
	);
}
