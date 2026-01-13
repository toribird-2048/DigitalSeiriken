import { NextResponse } from "next/server";
import { queueManager } from "@/src/core/queueManager";

export async function POST() {
  const ticket = await queueManager.enqueue();
  return NextResponse.json(ticket);
}
