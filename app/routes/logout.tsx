import type { ActionArgs, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/utils/session.server";

export const action = async ({ request }: ActionArgs) => logout(request);

export const loader: LoaderFunction = async () => redirect("/");
