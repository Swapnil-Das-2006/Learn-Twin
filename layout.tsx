import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LearnTwin — AI Learning Digital Twin',
  description: 'A living cognitive model of a student that observes, diagnoses, and adapts via Bayesian Knowledge Tracing and Directed Concept Graphs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060911] text-slate-100 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
