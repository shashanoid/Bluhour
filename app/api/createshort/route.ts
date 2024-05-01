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
    const { messages, voice_type } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!messages) {
      return new NextResponse("Missing messages", { status: 400 });
    }

    const isAllowed = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!isAllowed && !isPro) {
      return new NextResponse("API Limit Exceeded", { status: 403 });
    }

    //fetch http://184.105.6.166:5000/generate-video
    // @app.route('/generate-video/<prompt>', methods=['GET'])

    const response = await fetch(
      voice_type === "" || voice_type === "none"
        ? `${BACKEND_URL}/generate-video/${encodeURIComponent(messages)}`
        : `${BACKEND_URL}/generate-video/${encodeURIComponent(
            messages
          )}/${voice_type}`
    );

    if (!isPro) {
      await increaseApiLimit();
    }

    const responseData = await response.json();

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
