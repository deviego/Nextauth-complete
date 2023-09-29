import { db } from "@/lib/db";

import { NextResponse } from "next/server";
import { hash } from "bcrypt";

import * as z from 'zod'

const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),

  })
 

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = userSchema.parse(body) ;

    const existingUserByEmail = await db.user.findUnique({
      where: { email: email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { user: null, message: "User with this email already exist" },
        { status: 409 }
      );
    }

    const existingUserByUserName = await db.user.findUnique({
      where: { username: username },
    });

    if (existingUserByUserName) {
      return NextResponse.json(
        { user: null, message: "User with this user name already exist" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const {password: nweUserPassword, ...rest} = newUser;

    return NextResponse.json({user: rest, message:  "user created successfully"}, {status: 201});
  } catch(error) {
    console.error(error);
  }
}
