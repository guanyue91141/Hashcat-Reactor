import React from 'react';
import { Activity, AlertCircle, Clock, List, RefreshCw, Square, Trash2 } from 'lucide-react';
import { ATTACK_MODES, HASH_TYPES } from '../constants';
import { LogEntry, ReactorTask, RecoveredHash, SessionStats } from '../types';
import LogTerminal from './LogTerminal';
import RecoveredHashList from './RecoveredHashList';
import { useTranslation } from 'react-i18next';

interface Props {
  tasks: ReactorTask[];
  selectedTaskId: string | null;
  activeSessionId: string | null;
  sessions: Record<string, SessionStats>;
  logs: LogEntry[];
  cracks: RecoveredHash[];
  queueEnabled: boolean;
  onToggleQueue: () => void;
  onSelectTask: (task: ReactorTask) => void;
  onRerun: (task: ReactorTask) => void;
  onResume: (task: ReactorTask) => void;
  onStop: (task: ReactorTask) => void;
  onDelete: (task: ReactorTask) => void;
  onClearFinished: () => void;
  onSelectSession: (id: string | null) => void;
  onDeleteSession: (id: string) => void;
}

const TERMINAL = new Set(['COMPLETED', 'FAILED', 'STOPPED']);

const TaskManager: React.FC<Props> = ({ tasks, selectedTaskId, activeSessionId, sessions, logs, cracks, queueEnabled, onToggleQueue, onSelectTask, onRerun, onResume, onStop, onDelete, onClearFinished, onSelectSession, onDeleteSession }) => {
  const { t } = useTranslation();
  const selected = tasks.find(task => task.id === selectedTaskId) || null;
  const selectedStats = selected?.sessionId ? sessions[selected.sessionId] : undefined;
  const queuedCount = tasks.filter(task => task.status === 'QUEUED').length;
  const runningCount = tasks.filter(task => task.status === 'RUNNING' || task.status === 'PAUSED').length;
  const modeName = (id?: number) => ATTACK_MODES.find(mode => mode.id === id)?.name || (id === undefined ? '—' : `Mode ${id}`);
  const hashName = (id?: string) => HASH_TYPES.find(hash => hash.id === id)?.name || id || t('task_legacy_config');
  const statusName = (status: ReactorTask['status']) => t(`task_status_${status.toLowerCase()}`);
  const statusStyle: Record<ReactorTask['status'], string> = {
    QUEUED: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
    RUNNING: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    PAUSED: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    INTERRUPTED: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
    COMPLETED: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
    FAILED: 'text-red-300 bg-red-500/10 border-red-500/20',
    STOPPED: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  return <div className="space-y-5 animate-in fade-in duration-300">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><List className="text-indigo-500" />{t('task_list_title')}</h2>
        <p className="text-slate-500 text-sm mt-1">{t('task_list_desc', { count: tasks.length, queued: queuedCount, running: runningCount })}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleQueue} className={`px-3 py-2 rounded-lg text-sm font-bold border ${queueEnabled ? 'bg-emerald-600/15 text-emerald-300 border-emerald-500/30' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>{queueEnabled ? t('queue_btn_active') : t('queue_btn_paused')}</button>
        <button onClick={onClearFinished} disabled={!tasks.some(task => TERMINAL.has(task.status))} className="px-3 py-2 rounded-lg text-sm font-bold border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40">{t('task_clear_finished')}</button>
      </div>
    </div>

    {tasks.length === 0 ? <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-14 text-center text-slate-500">{t('task_list_empty')}</div> :
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800"><tr>
            <th className="p-3 pl-5">{t('task_col_status')}</th><th className="p-3">{t('task_col_hash')}</th><th className="p-3">{t('task_col_attack')}</th><th className="p-3">{t('task_col_target')}</th><th className="p-3">{t('task_col_progress')}</th><th className="p-3">{t('task_col_created')}</th><th className="p-3 text-right">{t('task_col_actions')}</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-800/50">{tasks.map(task => {
            const stats = task.sessionId ? sessions[task.sessionId] : undefined;
            const current = selectedTaskId === task.id;
            return <tr key={task.id} onClick={() => onSelectTask(task)} className={`cursor-pointer group hover:bg-slate-800/40 ${current ? 'bg-indigo-500/10' : ''}`}>
              <td className="p-3 pl-5"><span className={`px-2 py-1 rounded-full border text-[10px] font-bold uppercase ${statusStyle[task.status]}`}>{statusName(task.status)}</span>{task.legacy && <div className="text-[10px] text-slate-600 mt-1">{t('task_legacy')}</div>}</td>
              <td className="p-3"><div className="text-sm text-slate-200 font-medium">{hashName(task.config?.hashType)}</div><div className="text-xs text-slate-500">{task.config ? `${t('queue_label_mode')} ${task.config.hashType}` : t('task_legacy_config')}</div></td>
              <td className="p-3 text-sm text-slate-300">{task.workflowOpts ? t('task_smart_workflow') : modeName(task.config?.attackMode)}</td>
              <td className="p-3 text-sm text-slate-300 max-w-48 truncate" title={task.targetSummary}>{task.targetSummary}</td>
              <td className="p-3 text-xs text-slate-400">{stats ? `${stats.progress.toFixed(1)}% · ${stats.recovered}/${stats.total}` : `${task.recovered || 0}/${task.totalHashes || '—'}`}</td>
              <td className="p-3 text-xs text-slate-500 whitespace-nowrap"><Clock size={12} className="inline mr-1" />{new Date(task.createdAt).toLocaleString()}</td>
              <td className="p-3 text-right whitespace-nowrap" onClick={event => event.stopPropagation()}>
                <button type="button" onClick={() => onRerun(task)} disabled={!task.config} title={task.config ? t('task_rerun') : t('task_rerun_unavailable')} aria-label={task.config ? t('task_rerun') : t('task_rerun_unavailable')} className="p-2 mr-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed"><PlayRerunIcon /></button>
                {task.status === 'INTERRUPTED' && <button onClick={() => onResume(task)} disabled={!task.resumeAvailable || !task.sessionId} title={!task.resumeAvailable ? t('task_restore_unavailable') : t('task_resume')} className="p-2 mr-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 disabled:opacity-30"><RefreshCw size={14} /></button>}
                {['RUNNING', 'PAUSED'].includes(task.status) && <button onClick={() => onStop(task)} title={t('btn_stop')} className="p-2 mr-1 rounded bg-red-500/10 text-red-300 border border-red-500/20"><Square size={14} /></button>}
                {task.status === 'RUNNING' && <Activity size={15} className="inline mr-2 text-emerald-400 animate-pulse" />}
                {!['RUNNING', 'PAUSED'].includes(task.status) && <button onClick={() => onDelete(task)} title={t('task_delete')} className="p-2 rounded text-slate-500 hover:text-red-300 hover:bg-red-500/10"><Trash2 size={14} /></button>}
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>}

    {selected && <div className="space-y-3">
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <span className="text-slate-400">{t('task_detail_target')}: <span className="font-mono text-slate-200">{selected.targetSummary}</span></span>
        <span className="text-slate-400">{t('task_detail_result')}: <span className="text-emerald-300">{selectedStats?.recovered ?? selected.recovered ?? 0} / {selectedStats?.total || selected.totalHashes || '—'}</span></span>
        {selected.failureReason && <span className="flex items-center gap-1.5 text-amber-300"><AlertCircle size={13} />{selected.failureReason}</span>}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-[24rem]">
        <div className="min-h-[24rem] h-[32rem]"><LogTerminal logs={logs} sessions={sessions} activeSessionId={activeSessionId} onSelectSession={onSelectSession} onDeleteSession={onDeleteSession} showSessionList={false} /></div>
        <div className="min-h-[24rem] h-[32rem]"><RecoveredHashList hashes={cracks} /></div>
      </div>
    </div>}
  </div>;
};

const PlayRerunIcon = () => <RefreshCw size={14} aria-hidden="true" />;

export default TaskManager;
