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
      setCurrentTicket(data.callingTicket);
      }
    }, []);

  const handleCallNext = async () => {
    const res = await fetch("/api/dequeue", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.ticket) {
        setCurrentTicket(data.callingTicket);
      fetchStatus();
      }
    } else {
      alert("チケットを待っている人はいません");
    }
  };

  const completeCurrentTicket = async () => {
    const res = await fetch("/api/complete", { method: "POST", body: JSON.stringify({ id: currentTicket?.id }) });
    if (res.ok) {
      setCurrentTicket(null);
      fetchStatus();
    }
  }

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* メインカード */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Admin Control</h1>
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            STAFF ONLY
          </span>
        </div>

        {/* 現在の呼び出し状況（メイン表示） */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">Current Ticket</p>
          
          <div className="bg-blue-50 rounded-2xl p-6 mb-2 border border-blue-100">
            <div className="text-6xl font-black text-blue-600 mb-2">
              {currentTicket ? `#${currentTicket.number}` : "--"}
            </div>
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                currentTicket 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-200 text-gray-500"
              }`}>
              {currentTicket ? currentTicket.status : "Waiting..."}
            </div>
          </div>
        </div>

        {/* 待機人数表示 */}
        <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl">
          <span className="text-gray-500 font-medium">Waiting Queue</span>
          <span className="text-2xl font-bold text-gray-800">
            {waitingCount} <span className="text-sm font-normal text-gray-400">人</span>
          </span>
        </div>

        {/* 次へボタン */}
        <button 
          onClick={() => handleCallNext()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold mb-4 py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Call Next Ticket</span>
        </button>

        <button 
          onClick={() => completeCurrentTicket()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Complete Current Ticket</span>
        </button>

      </div>
    </div>
  );
}
