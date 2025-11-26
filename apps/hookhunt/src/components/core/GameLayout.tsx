import React from "react";

export const GameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export const GameHeader: React.FC<React.PropsWithChildren> = ({ children }) => (
  <header className="w-full flex justify-center mb-4">{children}</header>
);

export const GameBody: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="flex-grow flex flex-col items-center">{children}</main>
);

export const GameFooter: React.FC<React.PropsWithChildren> = ({ children }) => (
  <footer className="w-full mt-4">{children}</footer>
);
