import React, { useRef } from 'react'; 
import { Virtuoso } from 'react-virtuoso';
import { RecoveredHash } from '../types';
import { ShieldCheck, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  hashes: RecoveredHash[];
}

const RecoveredHashList = React.memo<Props>(({ hashes }) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper to decode Hashcat HEX output ($HEX[...]) to readable text
  const decodePlain = (plain: string) => {
      if (!plain) return '';
      const hexMatch = plain.match(/^\$HEX\[([a-fA-F0-9]+)\]$/);
      if (hexMatch) {
          try {
              const hex = hexMatch[1];
              let str = '';
              for (let i = 0; i < hex.length; i += 2) {
                  str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
              }
              return str;
          } catch (e) { return plain; }
      }
      return plain;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner min-h-0">
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-slate-200 font-bold text-sm">{t('rec_title')}</span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                {hashes.length}
            </span>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-hidden p-0"
      >
        {hashes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                <ShieldCheck size={32} />
                <span className="text-xs">{t('rec_empty')}</span>
            </div>
        ) : (
            <Virtuoso
              className="h-full w-full"
              data={hashes}
              itemContent={(_index, item) => {
                const readablePlain = decodePlain(item.plain);
                return (
                    <div 
                      className="p-3 border-b border-slate-800/50 transition-colors flex items-center justify-between group hover:bg-slate-900/50"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <span className="text-emerald-400 font-mono text-sm font-bold truncate" title={readablePlain}>
                                    {readablePlain}
                                </span>
                                <span className="text-slate-500 font-mono text-[10px] truncate" title={item.hash}>
                                    {item.hash}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(`${item.hash}:${readablePlain}`)}
                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-all"
                            title={t('rec_copy_tooltip')}
                        >
                            <Copy size={14} />
                        </button>
                    </div>
                );
              }}
            />
        )}
      </div>
    </div>
  );
});

export default RecoveredHashList;