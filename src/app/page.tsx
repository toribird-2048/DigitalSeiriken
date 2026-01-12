"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Ticket } from "@/src/core/queueManager";

export default function MainPage() {
  const [myTicket, setMyTicket] = useState<Ticket | null>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [callingNumber, setCallingNumber] = useState<number | null>(null);

  const STORAGE_KEY = "digital-seiriken-ticket";

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setWaitingCount(data.waitingCount);
        if (data.callingTicket) {
          setCallingNumber(data.callingTicket.number);
        } else {
          setCallingNumber(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  }, []);

  const handleGetTicket = async () => {
    try {
      const res = await fetch("/api/enqueue", { method: "POST" });
      if (res.ok) {
        const ticket: Ticket = await res.json();
        setMyTicket(ticket);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ticket))
        fetchStatus();
      }
    } catch (error) {
      console.error("整理券の発行に失敗しました", error);
    }
  };

  useEffect(() => {
    const savedTicketString = localStorage.getItem(STORAGE_KEY)
    if (savedTicketString) {
      try {
        const savedTicket: Ticket = JSON.parse(savedTicketString);
        setMyTicket(savedTicket)
      } catch(e) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (myTicket) {

    const isMyTurn = callingNumber === myTicket.number;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-100">
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">Your Number</p>
          <div className="text-6xl font-black text-blue-600 mb-6">
            #{myTicket.number}
          </div>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Current Calling</p>
            <p className="text-3xl font-bold text-gray-800">
              {callingNumber ? `#${callingNumber}` : "--"}
            </p>
          </div>

          {isMyTurn ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg animate-pulse font-bold">
              あなたの番です！ブースへお越しください！
            </div>
          ) : (
             <div className="text-gray-500 text-sm">
                あなたの番までお待ちください...
             </div>
          )}
        </div>
      </div>
    );
  }

  // 2. 整理券を持っていない（初期）画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Digital Seiriken</h1>
        <p className="text-blue-100">部活動紹介 体験ブース</p>
      </div>

      <div className="bg-white text-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-100">
          <span className="text-gray-500">現在の待ち</span>
          <span className="text-2xl font-bold">{waitingCount} <span className="text-sm font-normal text-gray-400">人</span></span>
        </div>

        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-100">
          <span className="text-gray-500">呼出中の番号</span>
          <span className="text-2xl font-bold text-blue-600">
             {callingNumber ? `#${callingNumber}` : "--"}
          </span>
        </div>

        <button 
          onClick={handleGetTicket}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
        >
          <span>整理券を発行する</span>
        </button>
      </div>
    </div>
  );
}