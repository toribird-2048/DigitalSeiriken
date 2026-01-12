import { NextResponse } from "next/server";
import { queueManager } from "@/src/core/queueManager";

export async function POST(request: Request) {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    //console.log(id);
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }
  const status = queueManager.getMyStatus(id);
  return NextResponse.json(status);
}
