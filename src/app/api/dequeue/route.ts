import { NextResponse } from "next/server";
import { queueManager } from "@/src/core/queueManager";

export async function POST() {
  const dequeuedTicket = await queueManager.dequeue();
  if (dequeuedTicket) {
    return NextResponse.json({ ticket: dequeuedTicket });
  }
  return NextResponse.json({ message: "No tickets waiting" }, { status: 200 });
}
