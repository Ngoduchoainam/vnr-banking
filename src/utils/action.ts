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
    console.log(15, r)
    return r;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log("error 19: ", error)
    return { error: "Thông tin đăng nhập không đúng" };
  }
}
