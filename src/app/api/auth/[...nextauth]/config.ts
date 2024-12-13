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

console.log('AUTH_SECRET:', process.env.AUTH_SECRET);

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      authorize: async (credentials) => {
        console.log("Credentials received:", credentials);
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        if (!username || !password) {
          throw new Error("Missing username or password");
        }

        try {
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
        } catch (error) {
          console.error("Error during authorization:", error); // Log errors if the request fails
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user: unknown }) {
      console.log("JWT Callback - User:", user);
      if (user) {
        token.user = user as User;
      }
      console.log("JWT Callback - Token:", token);
      return token;
    },

    session({ session, token }: { session: Session; token: JWT }) {
      console.log("Session Callback - Token:", token); // Log token in session callback
      console.log("Session Callback - Session:", session);
      if (token.user) {
        session.user = token.user;
      }
      console.log("Session Callback - Updated Session:", session);
      return session;
    },
  },
};

export const { signIn, signOut, handlers, auth } = NextAuth(authOptions);
