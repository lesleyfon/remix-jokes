import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import {
	Meta,
	Links,
	LiveReload,
	Outlet,
	isRouteErrorResponse,
	useRouteError,
	Scripts,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";

import globalStylesUrl from "./styles/global.css";
import globalMediumStylesUrl from "./styles/global-medium.css";
import globalLargeStylesUrl from "./styles/global-large.css";

export const links: LinksFunction = () => {
	return [
		{
			rel: "stylesheet",
			href: globalStylesUrl,
		},
		{
			rel: "stylesheet",
			href: globalMediumStylesUrl,
			media: "print, (min-width: 640px)",
		},
		{
			rel: "stylesheet",
			href: globalLargeStylesUrl,
			media: "screen and (min-width: 1024px)",
		},
	];
};

export const meta: V2_MetaFunction = () => {
	const description = "Learn Remix and laugh at the same time!";

	return [
		{ name: "description", content: description },
		{ name: "twitter:description", content: description },
		{ title: "Remix: So great, it's funny!" },
	];
};

function Document({
	children,
	title = "Remix: So great, it's funny!",
}: PropsWithChildren<{ title?: string }>) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<meta name="keywords" content="Remix,jokes" />
				<meta name="twitter:image" content="https://remix-jokes.lol/social.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:creator" content="@remix_run" />
				<meta name="twitter:site" content="@remix_run" />
				<meta name="twitter:title" content="Remix Jokes" />
				<Meta />
				{title ? <title>{title}</title> : null}
				<Links />
			</head>
			<body>
				{children}
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<Document>
			<Outlet />
		</Document>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<Document title={`${error.status} ${error.statusText}`}>
				<div className="error-container">
					<h1>
						{error.status} {error.statusText}
					</h1>
				</div>
			</Document>
		);
	}

	const errorMessage = error instanceof Error ? error.message : "Unknown error";
	return (
		<Document title="Uh-oh!">
			<div className="error-container">
				<h1>App Error</h1>
				<pre>{errorMessage}</pre>
			</div>
		</Document>
	);
}
