"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full relative">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile overlay */}
      {sidebarOpen && (
         <div 
           className="fixed inset-0 bg-black/50 z-40 md:hidden" 
           onClick={() => setSidebarOpen(false)}
         />
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setSidebarOpen(true)} 
               className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
             >
               <Menu size={24} />
             </button>
             <h1 className="font-bold text-xl text-gray-800 md:hidden">FinMentor AI</h1>
           </div>
           <div className="hidden md:block"></div>
           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ring-2 ring-gray-100 shrink-0 ml-auto">
             US
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
