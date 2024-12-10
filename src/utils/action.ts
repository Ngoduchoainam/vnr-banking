"use server";

import { signIn } from "../app/api/auth/[...nextauth]/config";

export async function authenticatorResponse(
  username: string,
  password: string
) {
  try {
    const r = await signIn("credentials", {
      username: username,
      password: password,
      redirect: false,
    });
    return r;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: "Intet username or password" };
  }
}
