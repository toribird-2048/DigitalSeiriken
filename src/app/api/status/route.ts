import { NextResponse } from "next/server";
import { queueManager } from "@/src/core/queueManager";

export async function GET() {
  const status = await queueManager.getCurrentStatus();
  return NextResponse.json(status);
}
