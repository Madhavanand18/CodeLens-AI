// src/App.tsx

import React from "react";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/hero/Hero";
import Features from "./components/features/Features";
import Dashboard from "./components/dashboard/Dashboard";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Dashboard />
    </>
  );
};

export default App;