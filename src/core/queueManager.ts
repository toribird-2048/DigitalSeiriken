import { createClient, RedisClientType } from "redis";
import { randomUUID } from "node:crypto";

export type TicketStatus = "waiting" | "calling" | "completed";

export type Ticket = {
  id: string;
  number: number;
  status: TicketStatus;
  createdAt: Date;
};

const KEY_TICKETS = "queue:tickets";
const KEY_NEXT_NUMBER = "queue:next_number";

let redisClient: RedisClientType | undefined;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    
    await redisClient.connect();
  }
  return redisClient;
}

export class QueueManager {
  private async getAllTickets(): Promise<Ticket[]> {
    const client = await getRedisClient();
    const ticketsJson = await client.lRange(KEY_TICKETS, 0, -1);

    return ticketsJson.map(str => {
      const t = JSON.parse(str);
      return { ...t, createdAt: new Date(t.createdAt) };
    });
  }

  private async updateTicketAtIndex(index: number, ticket: Ticket) {
    const client = await getRedisClient();
    // LSET key index value
    await client.lSet(KEY_TICKETS, index, JSON.stringify(ticket));
  }

  /**
   * 新しい整理券を発行して列に追加する
   * @ returns 発行されたチケット
   */
  public async enqueue(): Promise<Ticket> {
    const client = await getRedisClient();
    console.log("Redis connected");
    const number = await client.incr(KEY_NEXT_NUMBER);
    console.log("Generated Number:", number, "Type:", typeof number); 

    const newTicket: Ticket = {
      id: randomUUID(),
      number: number,
      status: "waiting",
      createdAt: new Date(),
    };
    console.log("New Ticket Object:", JSON.stringify(newTicket)); 
    
    await client.rPush(KEY_TICKETS, JSON.stringify(newTicket));
    return newTicket;
  }

  /**
   * 待っている先頭のTicketを「呼出中」ステータスに変更する
   * @returns ステータス更新されたTicket。待ちがいない場合は undefined または null
   */
  public async dequeue(): Promise<Ticket | undefined> {
    const tickets = await this.getAllTickets();

    const currentCalling = tickets.find(t => t.status === 'calling');
    if (currentCalling) {
      return undefined; 
    }

    // 待ち行列の先頭を探す
    const waitingIndex = tickets.findIndex(t => t.status === 'waiting');
    if (waitingIndex === -1) {
      return undefined;
    }

    // ステータス更新
    const targetTicket = tickets[waitingIndex];
    targetTicket.status = 'calling';

    // Redis更新
    await this.updateTicketAtIndex(waitingIndex, targetTicket);

    return targetTicket;
  }

  /**
   * 指定されたIDのTicketを「完了」ステータスにする
   * @param id TicketのID
   * @returns 更新成功ならtrue, 失敗(IDがない等)ならfalse
   */
  public async complete(id: string): Promise<boolean> {
    const tickets = await this.getAllTickets();
    const index = tickets.findIndex(t => t.id === id);
    
    if (index === -1) return false;

    const ticket = tickets[index];
    if (ticket.status !== "calling") return false;

    ticket.status = "completed";

    await this.updateTicketAtIndex(index, ticket);

    return true;
  }
  /**
   * 現在の状況を取得する
   * @returns 待ち人数、現在呼び出し中のTicketリスト、などを返すオブジェクト
   */
  public async getCurrentStatus() {
    const tickets = await this.getAllTickets();

    const waitingCount = tickets.filter(t => t.status === "waiting").length;
    const callingTickets = tickets.filter(t => t.status === "calling");

    return { waitingCount, callingTickets };
  }

  public async getTicketByID(id: string): Promise<Ticket | undefined> {
    const tickets = await this.getAllTickets();
    return tickets.find(t => t.id === id);
  }
}

export const queueManager = new QueueManager();
