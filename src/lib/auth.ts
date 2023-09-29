import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "Email", placeholder: "johndoe@gmail" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existUser = await db.user.findUnique(
          {where: {email : credentials?.email}}
        )
        if(!existUser){
          return null;
        }

        const passwordMatch = await compare(credentials?.password,existUser.password)

        if(!passwordMatch){
          return null;
        }

        return { 
          id: `${existUser.id}`,
          username: existUser.username,
          email: existUser.email,
        }
      },
    }),
  ],
};
