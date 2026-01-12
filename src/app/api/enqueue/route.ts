import { NextResponse } from "next/server";
import { queueManager } from "@/src/core/queueManager";

export async function POST() {
  const ticket = queueManager.enqueue();
  return NextResponse.json(ticket);
}
