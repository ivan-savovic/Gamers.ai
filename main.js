// ===============================
// GameVerse.AI ‑ Functional MVP
// ===============================
// Project structure (single file for brevity – split into real files in your repo):
// ├── package.json
// ├── tailwind.config.js
// ├── postcss.config.js
// ├── next.config.js
// ├── app/
// │   ├─ layout.tsx
// │   ├─ globals.css
// │   ├─ page.tsx
// │   └─ api/
// │       └─ ai/route.ts
// ├── lib/
// │   └─ supabaseClient.ts
// └── components/
//     ├─ GameCard.tsx
//     ├─ Chat.tsx
//     └─ CommunityChat.tsx
// =============================================================

/**
 * 📑 README (condensed)
 * 1. Copy these snippets into their respective files.
 * 2. Install deps ➜  npm i
 * 3. Add ENV vars ➜  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY
 * 4. Run ➜  npm run dev
 * 5. In Supabase ➜ create table `messages` (id uuid pk default uuid_generate_v4(), content text, username text, created_at timestamptz default now())
 * 6. Enable Realtime for `messages` table.
 */

// -------- package.json --------
{
  "name": "gameverse-ai",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "lucide-react": "^0.291.0",
    "next": "14.2.0",
    "openai": "^4.23.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.2",
    "typescript": "^5.4.4"
  }
}

// -------- tailwind.config.js --------
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed"
      }
    }
  },
  plugins: []
};

// -------- postcss.config.js --------
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

// -------- next.config.js --------
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};
module.exports = nextConfig;

// -------- app/globals.css --------
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-950 text-white;
}

// -------- lib/supabaseClient.ts --------
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// -------- components/GameCard.tsx --------
"use client";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props {
  name: string;
}

export default function GameCard({ name }: Props) {
  return (
    <Link href={`/#${name.replace(/\s+/g, "-").toLowerCase()}`}
      className="bg-gray-900 p-4 rounded-2xl hover:scale-105 transition duration-200 block">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">{name}</h2>
        <Gamepad2 className="text-primary" />
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Join the {name} community &amp; chat with our AI for tips.
      </p>
    </Link>
  );
}

// -------- components/Chat.tsx --------
"use client";
import React, { useState } from "react";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages })
    });

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl flex flex-col min-h-[400px]">
      <h3 className="text-lg font-semibold mb-4 text-primary">Ask GameVerse AI</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
        {messages.map((m, i) => (
          <p key={i} className={m.role === "user" ? "text-right" : "text-left text-primary"}>
            <span className="text-gray-400">{m.role === "user" ? "You: " : "AI: "}</span>
            {m.content}
          </p>
        ))}
        {loading && <p className="text-primary">AI is typing…</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Best sniper loadout in Warzone?"
          className="flex-1 bg-gray-800 rounded-xl px-3 py-2 focus:outline-none"
        />
        <button onClick={sendMessage} className="bg-primary px-4 py-2 rounded-xl">
          Send
        </button>
      </div>
    </div>
  );
}

// -------- components/CommunityChat.tsx --------
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Message {
  id: string;
  content: string;
  username: string;
  created_at: string;
}

export default function CommunityChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const username = typeof window !== "undefined" ? localStorage.getItem("gv_username") || "anon" : "anon";

  useEffect(() => {
    // Initial fetch
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(50);
      setMessages(data || []);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase.channel("public:messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      setMessages((prev) => [payload.new as Message, ...prev]);
    });
    channel.subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    await supabase.from("messages").insert({ content: newMsg, username });
    setNewMsg("");
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl flex flex-col min-h-[400px]">
      <h3 className="text-lg font-semibold mb-4 text-primary">Community Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
        {messages.map((m) => (
          <p key={m.id}>
            <span className="text-primary">{m.username}: </span>
            <span className="text-gray-200">{m.content}</span>
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Say something…"
          className="flex-1 bg-gray-800 rounded-xl px-3 py-2 focus:outline-none"
        />
        <button onClick={sendMessage} className="bg-primary px-4 py-2 rounded-xl">
          Send
        </button>
      </div>
    </div>
  );
}

// -------- app/layout.tsx --------
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameVerse.AI",
  description: "AI‑powered community hub for gamers"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}

// -------- app/page.tsx --------
import GameCard from "@/components/GameCard";
import Chat from "@/components/Chat";
import CommunityChat from "@/components/CommunityChat";

const games = [
  "Fortnite",
  "League of Legends",
  "Call of Duty",
  "Minecraft",
  "Valorant",
  "CS2",
  "Apex Legends",
  "GTA V",
  "Roblox"
];

export default function Home() {
  return (
    <main className="p-6 flex-1 space-y-12">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-primary">GameVerse.AI</h1>
        <a href="#community" className="bg-primary px-4 py-2 rounded-xl">Join Chat</a>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game} name={game} />
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-8" id="ai">
        <Chat />
      </section>

      <section id="community">
        <CommunityChat />
      </section>
    </main>
  );
}

// -------- app/api/ai/route.ts --------
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { messages } = await req.json();
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m: any) => ({ role: m.role, content: m.content }))
    });
    return NextResponse.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    return NextResponse.json({ reply: "Sorry, AI service is unavailable." }, { status: 500 });
  }
}
