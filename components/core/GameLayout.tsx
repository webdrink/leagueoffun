import React from "react";

export const GameLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen flex flex-col">{children}</div>
);

export const GameHeader: React.FC<React.PropsWithChildren> = ({ children }) => (
  <header className="w-full flex justify-center mb-3 sm:mb-4">{children}</header>
);

export const GameBody: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="flex-grow flex flex-col items-center min-h-0 overflow-y-auto">{children}</main>
);

export const GameFooter: React.FC<React.PropsWithChildren> = ({ children }) => (
  <footer className="w-full mt-3 sm:mt-4">{children}</footer>
);
