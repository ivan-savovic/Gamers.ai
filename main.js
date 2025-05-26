// =============================================================
// 📁 Professional Next.js 14 ‑ GameVerse.AI
// =============================================================
// Production‑ready file tree (copy exactly):
// ├── package.json
// ├── tsconfig.json
// ├── tailwind.config.cjs
// ├── postcss.config.cjs
// ├── next.config.mjs
// ├── .env.local               ← add your keys here
// ├── src/
// │   ├─ app/
// │   │   ├─ layout.tsx
// │   │   ├─ globals.css
// │   │   └─ page.tsx
// │   ├─ components/
// │   │   ├─ GameCard.tsx
// │   │   ├─ Chat.tsx
// │   │   └─ CommunityChat.tsx
// │   └─ lib/
// │       └─ supabaseClient.ts
// └── README.md (quick‑start)
// =============================================================
// 1.   npm install
// 2.   touch .env.local  →  add NEXT_PUBLIC_SUPABASE_URL=…, NEXT_PUBLIC_SUPABASE_ANON_KEY=…, OPENAI_API_KEY=…
// 3.   npm run dev
// 4.   In Supabase enable Realtime on table `messages` (schema at bottom).
// =============================================================

// ---------- package.json ----------
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
    "lucide-react": "^0.292.0",
    "next": "14.2.3",
    "openai": "^4.25.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5"
  }
}

// ---------- tsconfig.json ----------
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*"],
  "exclude": ["node_modules"]
}

// ---------- tailwind.config.cjs ----------
const colors = require("tailwindcss/colors");
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#FFD700",
          yellow: "#ffcc00",
          black: "#0f0f0f"
        }
      }
    }
  },
  plugins: []
};

// ---------- postcss.config.cjs ----------
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

// ---------- next.config.mjs ----------
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: []
  }
};
export default nextConfig;

// ---------- src/app/globals.css ----------
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0f0f0f;
  --gold: #FFD700;
  --yellow: #ffcc00;
}

html {
  background-color: var(--bg);
  color: white;
  scroll-behavior: smooth;
}

// ---------- src/lib/supabaseClient.ts ----------
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---------- src/components/GameCard.tsx ----------
"use client";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";

interface Props {
  name: string;
}

export default function GameCard({ name }: Props) {
  return (
    <Link
      href={`/#${name.replace(/\s+/g, "-").toLowerCase()}`}
      className="bg-zinc-900 border border-brand-yellow rounded-2xl p-5 hover:scale-105 transition-transform duration-200"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-brand-gold">{name}</h2>
        <Gamepad2 className="text-brand-yellow" />
      </div>
      <p className="text-sm text-zinc-300 mt-2">
        Join the {name} community & get AI‑powered tips.
      </p>
    </Link>
  );
}

// ---------- src/components/Chat.tsx ----------
"use client";
import React, { useState } from "react";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const updated = [...messages, { role: "user", content: query }];
    setMessages(updated);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated })
      });
      const data = await res.json();
      setMessages([...updated, { role: "assistant", content: data.reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-brand-yellow rounded-2xl p-6 flex flex-col min-h-[420px]">
      <h3 className="text-lg font-semibold text-brand-gold mb-4">Ask GameVerse AI</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
        {messages.map((m, i) => (
          <p key={i} className={m.role === "user" ? "text-right" : "text-left text-brand-yellow"}>
            <span className="text-brand-gold">{m.role === "user" ? "You: " : "AI: "}</span>
            {m.content}
          </p>
        ))}
        {loading && <p className="text-brand-yellow">AI is typing…</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Best sniper loadout in Warzone?"
          className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!query.trim()}
          className="bg-brand-gold text-black px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ---------- src/components/CommunityChat.tsx ----------
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
    const fetchInitial = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setMessages(data || []);
    };
    fetchInitial();

    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => setMessages((prev) => [payload.new as Message, ...prev])
      )
      .subscribe();

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
    <div className="bg-zinc-900 border border-brand-yellow rounded-2xl p-6 flex flex-col min-h-[420px]">
      <h3 className="text-lg font-semibold text-brand-gold mb-4">Community Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
        {messages.map((m) => (
          <p key={m.id}>
            <span className="text-brand-yellow font-semibold">{m.username}: </span>
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
          className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!newMsg.trim()}
          className="bg-brand-gold text-black px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ---------- src/app/layout.tsx ----------
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameVerse.AI",
  description: "AI‑powered community hub for gamers"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-black text-white font-sans">
        <main className="container mx-auto flex-1 flex flex-col px-4 md:px-8 py-6">{children}</main>
      </body>
    </html>
  );
}

// ---------- src/app/page.tsx ----------
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

const useCases = [
  {
    title: "AI Game Assistant",
    description: "Answer player questions, offer game tips, and assist with quests or strategies."
  },
  {
    title: "Procedural Content Generation",
    description: "Generate maps, levels, weapons, or missions tailored to each player."
  },
  {
    title: "Automated Testing",
    description: "Simulate user interactions for bug detection and QA regression tests."
  },
  {
    title: "NPC Dialogue & Behavior",
    description: "Make NPCs more realistic with dynamic conversations and intelligent responses."
  },
  {
    title: "AI Moderation",
    description: "Automatically detect toxicity, spam, or inappropriate behavior in multiplayer games."
  },
  {
    title: "Real-time Coaching",
    description: "Provide in-game performance feedback and personalized tips to players as they play."
  }
];

export default function Home() {
  return (
    <div className="space-y-14">
      {/* hero */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-gold drop-shadow-lg">
          GameVerse<span className="text-brand-yellow">.AI</span>
        </h1>
        <a
          href="#community"
          className="bg-brand-gold text-black font-semibold px-5 py-3 rounded-xl shadow hover:brightness-110 transition"
        >
          Join Community
        </a>
      </header>

      {/* featured games */}
      <section>
        <h2 className="sr-only">Featured Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((g) => (
            <GameCard key={g} name={g} />
          ))}
        </div>
      </section>

      {/* AI use cases */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-brand-yellow">Game AI Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {useCases.map((u) => (
            <div
              key={u.title}
              className="bg-zinc-900 border border-brand-yellow p-6 rounded-2xl shadow hover:scale-[1.02] transition-transform"
            >
              <h3 className="text-xl font-semibold text-brand-gold mb-2">{u.title}</h3>
              <p className="text-zinc-300 leading-relaxed">{u.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI chat */}
      <section id="ai" className="grid md:grid-cols-2 gap-8">
        <Chat />
      </section>

      {/* community */}
      <section id="community">
        <CommunityChat />
      </section>
    </div>
  );
}