import { randomUUID } from "node:crypto";

export type TicketStatus = "waiting" | "calling" | "completed";

export type Ticket = {
  id: string;
  number: number;
  status: TicketStatus;
  createdAt: Date;
};

export class QueueManager {
  private tickets: Ticket[] = [];
  private nextNumber: number = 1;

  constructor() {}

  /**
   * 新しい整理券を発行して列に追加する
   * @ returns 発行されたチケット
   */
  public enqueue(): Ticket {
    const newTicket: Ticket = {
      id: randomUUID(),
      number: this.nextNumber++,
      status: "waiting",
      createdAt: new Date(),
    };
    this.tickets.push(newTicket);
    return newTicket;
  }

  /**
   * 待っている先頭のTicketを「呼出中」ステータスに変更する
   * @returns ステータス更新されたTicket。待ちがいない場合は undefined または null
   */
  public dequeue(): Ticket | undefined {
    if (this.tickets.length === 0) {
      return undefined;
    }
    const callingTicket = this.tickets.find((t) => t.status === "calling");
    if (!callingTicket) {
      const waitingTicket = this.tickets.find((t) => t.status === "waiting");
      if (waitingTicket) {
        waitingTicket.status = "calling";
        return waitingTicket;
      }
    } else {
      return undefined;
    }
  }

  /**
   * 指定されたIDのTicketを「完了」ステータスにする
   * @param id TicketのID
   * @returns 更新成功ならtrue, 失敗(IDがない等)ならfalse
   */
  public complete(id: string): boolean {
    const ticket = this.tickets.find((t) => t.id === id);
    if (ticket && ticket.status === "calling") {
      ticket.status = "completed";
      return true;
    }
    return false;
  }
  /**
   * 現在の状況を取得する
   * @returns 待ち人数、現在呼び出し中のTicketリスト、などを返すオブジェクト
   */
  public getCurrentStatus() {
    const waitingCount = this.tickets.filter(
      (t) => t.status === "waiting"
    ).length;
    const callingTicket = this.tickets.find((t) => t.status === "calling");
    return { waitingCount, callingTicket };
  }

  public getMyStatus(id: string) {
    const myTicket = this.tickets.find((t) => t.id === id);
    if (!myTicket) return null;
    return myTicket;
  }

  public getTicketByID(id: string) {
    return this.tickets.find((t) => t.id === id);
  }
}

const globalForQueue = global as unknown as { queueManager: QueueManager };
export const queueManager = globalForQueue.queueManager || new QueueManager();

if (process.env.NODE_ENV !== "production") {
  globalForQueue.queueManager = queueManager;
}
