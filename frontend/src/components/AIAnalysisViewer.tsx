import React from 'react';
import { AlertTriangle, Info, Terminal, ChevronRight } from 'lucide-react';

interface AIAnalysisViewerProps {
  rawAnalysis: string;
}

export const AIAnalysisViewer: React.FC<AIAnalysisViewerProps> = ({ rawAnalysis }) => {
  if (!rawAnalysis) return null;

  const lines = rawAnalysis.split('\n');

  return (
    <div className="w-full space-y-3 font-mono text-sm tracking-tight text-zinc-300">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) return <div key={index} className="h-2" />;

        if (trimmed.startsWith('**Phase') || trimmed.startsWith('Phase')) {
          return (
            <div key={index} className="pt-4 pb-1 border-b border-zinc-800 first:pt-0">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={12} className="text-emerald-500" />
                {trimmed.replace(/\*\*|\[!\]|\[\+\]|\[-\]/g, '')}
              </h3>
            </div>
          );
        }

        if (trimmed.startsWith('[!]')) {
          return (
            <div key={index} className="flex items-start gap-3 p-3 rounded bg-red-950/20 border border-red-900/40 text-red-200">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <div>{trimmed.replace('[!]', '').trim()}</div>
            </div>
          );
        }

        if (trimmed.startsWith('[+]')) {
          return (
            <div key={index} className="flex items-start gap-3 p-3 rounded bg-emerald-950/10 border border-emerald-900/30 text-zinc-200">
              <ChevronRight size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>{trimmed.replace('[+]', '').trim()}</div>
            </div>
          );
        }

        if (trimmed.startsWith('[-]')) {
          return (
            <div key={index} className="flex items-start gap-3 p-2 text-zinc-400 pl-4 border-l-2 border-zinc-700">
              <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
              <div>{trimmed.replace('[-]', '').trim()}</div>
            </div>
          );
        }

        return (
          <div key={index} className="pl-7 text-zinc-400 leading-relaxed">
            {trimmed}
          </div>
        );
      })}
    </div>
  );
};