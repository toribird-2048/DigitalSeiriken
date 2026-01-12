import { NextResponse } from "next/server";
import { queueManager } from "@/src/core/queueManager";

export async function POST(request: Request) {
  const body = await request.json();
  const{ id } = body;

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  const success = await queueManager.complete(id);

  if (success) {
    return NextResponse.json({ message: "Completed successfully"});
  } else {
    return NextResponse.json({ message: "Ticket not found or not calling" }, {status: 404});
  }
}
