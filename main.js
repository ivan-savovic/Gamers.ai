import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Gamepad2, Bot } from "lucide-react";

const games = [
  "Fortnite",
  "League of Legends",
  "Call of Duty",
  "Minecraft",
  "Valorant",
  "CS2",
  "Apex Legends",
  "GTA V",
  "Roblox",
];

export default function GameverseAI() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-purple-400">GameVerse.AI</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">Join Now</Button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {games.map((game) => (
          <Card key={game} className="bg-gray-900 hover:scale-105 transition duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-purple-300">{game}</h2>
                <Gamepad2 className="text-purple-500" />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Join the {game} community and get AI tips, chat with gamers, and check live news.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <Card className="bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Bot className="mr-2 text-purple-400" />
              <h3 className="text-lg font-semibold">Talk to Game AI</h3>
            </div>
            <Input className="bg-gray-800 text-white" placeholder="Ask about any game..." />
            <p className="mt-2 text-sm text-gray-400">Example: "Best sniper loadout in Warzone?"</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="mr-2 text-purple-400" />
              <h3 className="text-lg font-semibold">Community Forum</h3>
            </div>
            <p className="text-sm text-gray-400 mb-2">Chat with fellow gamers, join voice lobbies, and share memes.</p>
            <Button className="bg-purple-600 hover:bg-purple-700">Enter Forum</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}