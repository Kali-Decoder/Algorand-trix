/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body,"body")
    const res = await handleSwap(body);
    return res;
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}

async function handleSwap(body: any) {
  const { action, amount, tokenId } = body;

  try {
    let res;
    if (action==="native") {
      res = await axios.post(
        "http://localhost:8080/api/convertCoreToDesiredToken",
        {
          tokenId,
          amount,
        }
      );
    } else {
      res = await axios.post(
        "http://localhost:8080/api/convertDesiredTokenToCore",
        {
          tokenId,
          amount,
        }
      );
    }
    console.log("Response:", res.data);
    return NextResponse.json({ url: res.data?.data?.url, status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
