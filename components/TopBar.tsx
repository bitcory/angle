import React, { useState } from 'react';
import { Copy, Check, Sparkles, Terminal } from 'lucide-react';
import { PromptParts } from '../types';
import { formatFullPrompt } from '../utils/promptLogic';

interface TopBarProps {
  parts: PromptParts;
}

export const TopBar: React.FC<TopBarProps> = ({ parts }) => {
  const [copied, setCopied] = useState(false);
  
  const fullPrompt = formatFullPrompt(parts);
  const promptHtml = `
    <span class="text-zinc-100">${parts.framing}</span>,
    <span class="text-zinc-100">${parts.angle}</span>,
    <span class="text-zinc-100">${parts.view}</span>,
    <span class="text-zinc-500">(${parts.technical})</span>
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 px-4 z-50 flex justify-center pointer-events-none">
      <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 rounded-full px-4 py-2.5 md:px-6 md:py-3 shadow-2xl flex items-center gap-2 md:gap-4 pointer-events-auto max-w-2xl w-full">
        <Terminal size={16} className="text-zinc-500 hidden sm:block" />

        <div
          className="flex-1 font-mono text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis"
          dangerouslySetInnerHTML={{ __html: promptHtml }}
        />

        <div className="h-4 w-[1px] bg-zinc-700 mx-1 md:mx-2"></div>

        <button
          onClick={handleCopy}
          className="p-1.5 md:p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};