import bcrypt from "bcryptjs";
import {
  Session,
  SessionData,
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";
import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function login({
  username,
  password,
}: LoginForm) {

  const user = await db.user.findUnique({
    where: { username },
  });
  // Is user does'nt exist, we don't let the user in
  if (!user) return null;

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  // Is user password doesn't match, we don't let the user in
  if (!isCorrectPassword) return null;

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();

  session.set("userId", userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

function getUserSession(request: Request): Promise<Session<SessionData>> {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function getUserId(request: Request) {
  let session = await getUserSession(request)
  let userId: string | undefined = session.get('userId');

  if (!userId) {
    return null
  }

  return userId
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);

  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo],
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}


export async function register({
  password,
  username,
}: LoginForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { passwordHash, username },
  });
  return { id: user.id, username };
}

export async function logout(request: Request) {


  const session = await getUserSession(request);

  return redirect('/jokes', {
    headers: {
      'Set-Cookie': await storage.destroySession(session, {
        expires: new Date(0)
      })
    }
  })
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      select: { id: true, username: true, createdAt: true, updatedAt: true, passwordHash: true },
      where: { id: userId },
    });
    return user;
  } catch {
    throw logout(request);
  }
}