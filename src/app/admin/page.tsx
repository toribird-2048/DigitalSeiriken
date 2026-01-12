"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Ticket } from "@/src/core/queueManager";

export default function AdminPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/status", { method: "GET" });
    if (res.ok) {
      const data = await res.json();
      setWaitingCount(data.waitingCount);
      setCurrentTicket(data.callingTicket || null);
    }
  }, []);

  const handleCallNext = async () => {
    const res = await fetch("/api/dequeue", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.ticket) {
        setCurrentTicket(data.ticket);
      fetchStatus();
      }
    } else {
      alert("チケットを待っている人はいません");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div>
      <h1>Admin Page</h1>
      <button onClick={() => handleCallNext()}>Call Next Ticket</button>
      <div>
        <h2>
          Current Ticket:{" "}
          {currentTicket
            ? `#${currentTicket.number} (${currentTicket.status})`
            : "None"}
        </h2>
        <h2>waitingCount: {waitingCount}</h2>
      </div>
    </div>
  );
}
