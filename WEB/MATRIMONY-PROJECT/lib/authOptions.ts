import CredentialsProvider from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import type { AuthOptions } from "next-auth";

const sql = neon(process.env.DATABASE_URL!);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Fetch user from Neon
        const result = await sql`
          SELECT * FROM users WHERE email = ${email} LIMIT 1;
        `;
        const user = result[0];

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ token, session }) {
      if (token?.sub && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
