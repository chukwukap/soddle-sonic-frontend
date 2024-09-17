"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "./_components/searchBar";
import { GameType } from "@/lib/constants";
import TimerDisplay from "./_components/timeDisplay";
import Container from "@/components/layout/container";
import { AttributesGuessListTable } from "./_components/attributesGuessList";

import Legend from "./_components/legends";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import { useGameSession } from "@/hooks/useGameSession";
import { useRootStore } from "@/stores/storeProvider";
import { GameSession, GameSessionFromApi, KOL } from "@/types";
import QuestionBox from "./_components/questionBox";
import { fetchGameSessionFromApi } from "@/lib/api";

export default function GameIdPageClient({ kols }: { kols: KOL[] }) {
  const router = useRouter();
  const { wallet } = useWallet();
  const { fetchGameSession, makeGuess } = useGameSession();
  const [gameSess, setGameSess] = useState<GameSession | null>(null);
  const [apiGameSess, setApiGameSess] = useState<GameSessionFromApi | null>(
    null
  );

  const { ui, game } = useRootStore();
  const isLegendOpen = ui((state) => state.isLegendOpen);
  const setLoading = ui((state) => state.setLoading);
  const setError = ui((state) => state.setError);
  //   const setGameSession = game((state) => state.setGameSession);
  //   const gameSession = game((state) => state.gameSession);

  useEffect(() => {
    if (!wallet) {
      router.push("/");
    }
  }, [wallet, router, gameSess]);

  useEffect(() => {
    async function getGameSession() {
      const gameSession = await fetchGameSession(wallet?.adapter.publicKey!);
      const apiGameSess = await fetchGameSessionFromApi({
        publicKey: wallet?.adapter.publicKey?.toString()!,
      });

      console.log("api game session inside getGameSessaion", apiGameSess);
      if (gameSession) {
        setGameSess(gameSession);
        setApiGameSess(apiGameSess);
      }
    }

    try {
      setLoading(true);
      getGameSession();
    } catch (error) {
      toast.error("Error fetching game session");
      setError("Error fetching game session");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = async (kol: KOL) => {
    try {
      setLoading(true);
      if (kol) {
        await makeGuess(GameType.Attributes, kol);
        return;
      }
    } catch (error) {
      toast.error("Error making guess");
      setError("Error making guess");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 flex flex-col gap-4 ">
      {/* Time Component */}
      <Container>
        <section className="flex justify-center mb-4">
          <TimerDisplay />
        </section>
      </Container>
      {/* question box */}
      <Container>
        <QuestionBox className="">
          <section className=" text-white flex flex-col justify-between items-center">
            <h1 className="text-2xl font-bold text-center">
              Guess today's personality!
            </h1>
          </section>
        </QuestionBox>
      </Container>

      {/* search bar */}
      <Container>
        <SearchBar kols={kols} onSelect={handleSelect} />
      </Container>

      {/* guessResults section */}
      {
        <section className="text-white no-scrollbar">
          {apiGameSess && (
            <AttributesGuessListTable gameSessionFromApi={apiGameSess} />
          )}
        </section>
      }
      {/* Legends */}
      {isLegendOpen && (
        <Container>
          <Legend />
        </Container>
      )}
    </div>
  );
}
