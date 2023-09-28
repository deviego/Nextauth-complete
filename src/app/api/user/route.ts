import { db } from "@/lib/db";

import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function GET() {
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

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

    return NextResponse.json({user: newUser, message:  "user created successfully"}, {status: 201});
  } catch(error) {
    console.error(error);
  }
}
