import {NextResponse} from "next/server";
import {queueManager} from "@/src/core/queueManager";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id;
    
    const ticket = queueManager.getTicketByID(id);
    
    if (ticket) {
        return NextResponse.json(ticket);
    } else {
        return NextResponse.json({ message: "Ticket not found" }, { status: 404});
    }
}