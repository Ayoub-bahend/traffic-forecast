import React from "react";
import Dashboard from "./pages/Dashboard";

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-xl font-semibold">Traffic Forecast</h1>
          <p className="text-sm text-gray-500">
            Click the map, select date & time, then predict traffic.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Dashboard />
      </main>
    </div>
  );
}


