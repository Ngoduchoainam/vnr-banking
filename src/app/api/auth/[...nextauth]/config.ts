import NextAuth, { NextAuthConfig, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { httpClient } from "@/src/services/base_api";
import { JWT } from "next-auth/jwt";

export interface User {
  id: string | undefined;
  access_token: string;
  username: string;
  email?: string | null;
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      username?: string;
      email?: string;
      access_token?: string;
    };
  }

  interface JWT {
    user?: {
      id?: string;
      username?: string;
      email?: string;
      access_token?: string;
    };
  }
}

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      authorize: async (credentials) => {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        if (!username || !password) {
          throw new Error("Missing username or password");
        }

        const response = await httpClient.post("/account/login", {
          username,
          password,
        });

        const token = response?.data?.data?.token;

        if (!token) {
          throw new Error("Invalid credentials.");
        }

        return {
          id: response.data.data.userId,
          username: response?.data?.data.userName,
          access_token: token,
        };
      },
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user: unknown }) {
      if (user) {
        token.user = user as User;
      }
      return token;
    },

    session({ session, token }: { session: Session; token: JWT }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
};

export const { signIn, signOut, handlers, auth } = NextAuth(authOptions);
