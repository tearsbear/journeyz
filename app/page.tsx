"use client";

import { useState } from "react";
import { Welcome } from "./components/sections/Welcome";
import { Main } from "./components/sections/Main";

export default function Home() {
  const [showMain, setShowMain] = useState(false);

  return (
    <main className="flex min-h-screen flex-col">
      {!showMain ? <Welcome onStart={() => setShowMain(true)} /> : <Main />}
    </main>
  );
}
