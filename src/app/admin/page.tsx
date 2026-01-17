"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Ticket } from "@/src/core/queueManager";

export default function AdminPage() {
  const [callingTickets, setCallingTickets] = useState<Ticket[]>([]);
  const [waitingCount, setWaitingCount] = useState<number>(0);

  const [selectedTicketId, setSelectedTicketId] = useState<string>("");

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/status", { method: "GET" });
    if (res.ok) {
      const data = await res.json();
      setWaitingCount(data.waitingCount);
      setCallingTickets(data.callingTickets || []);
      }
    }, []);

  useEffect(() => {
    if (callingTickets.length > 0) {
      const isSelectedStillValid = callingTickets.some(t => t.id === selectedTicketId);
      if (!isSelectedStillValid) {
        setSelectedTicketId(callingTickets[0].id);
      }
    } else {
      setSelectedTicketId("");
    }
  }, [callingTickets, selectedTicketId])

  const handleCallNext = async () => {
    await fetch("/api/dequeue", { method: "POST" });
    fetchStatus();
  };

  const completeSelectedTicket = async () => {
    const res = await fetch("/api/complete", { 
      method: "POST", 
      body: JSON.stringify({ id: selectedTicketId }) 
    });
    if (res.ok) {
      fetchStatus();
    }
  }

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Control</h1>

        {/* --- 呼び出し中リストの表示 --- */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-2">Calling Now ({callingTickets.length})</p>
          <div className="flex flex-wrap gap-2">
            {callingTickets.length === 0 ? (
                <span className="text-gray-400 text-sm">Nobody calling</span>
            ) : (
                callingTickets.map(t => (
                    <div key={t.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                        #{t.number}
                    </div>
                ))
            )}
          </div>
        </div>

        {/* --- 完了操作エリア (プルダウン) --- */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Mark as Completed
            </label>
            
            <div className="flex gap-2">
                {/* これがプルダウンメニューだ */}
                <select 
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(e.target.value)}
                    disabled={callingTickets.length === 0}
                    className="block w-full rounded-md border-gray-300 text-gray-900 shadow-sm p-3 bg-white border"
                >
                    {callingTickets.map((t) => (
                        <option key={t.id} value={t.id}>
                            #{t.number} を完了にする
                        </option>
                    ))}
                    {callingTickets.length === 0 && <option>呼び出し中なし</option>}
                </select>

                <button 
                    onClick={completeSelectedTicket}
                    disabled={callingTickets.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg disabled:opacity-50"
                >
                    Complete
                </button>
            </div>
        </div>

        {/* --- 待機人数 --- */}
        <div className="mb-4 text-center">
             Wait: <span className="font-bold">{waitingCount}</span>
        </div>

        {/* --- 次へボタン --- */}
        <button 
          onClick={handleCallNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg"
        >
          Call Next Ticket
        </button>

      </div>
    </div>
  );
}