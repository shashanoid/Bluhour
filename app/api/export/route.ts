import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import axios from "axios";
import { BACKEND_URL } from "@/constants";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { metadata } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await axios.post(`http://localhost:4000/render`, {
      variables: metadata,
      callbackUrl: `${BACKEND_URL}/callback`,
    });

    console.log(response);

    const responseData = null;

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
