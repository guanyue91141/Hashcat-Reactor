export interface PhaseBreakdownEntry {
    phase: number;
    label: string;
    recovered: number;
    status: 'pending' | 'running' | 'done' | 'skipped' | 'aborted';
    learned?: number;
    masks?: number;
    hashrateHps?: number;
    hashrateSource?: string;
}

export interface PastSession {
    id: string;
    date: Date;
    duration: number;
    mode: string;
    algorithmId: string;
    attackType: string;
    attackMode: number;
    recovered: number;
    totalHashes: number;
    avgHashrate: number;
    powerUsage: number;
    phaseBreakdown?: PhaseBreakdownEntry[];
    maskFileId?: string;       // workflowId — present when smart workflow saved a mask file
    usedMasks?: number;        // count of masks that fit the time budget and were run in Phase 3
    skippedMasks?: number;     // count of masks skipped due to time budget
    sessionId?: string;        // hashcat session id — used to rehydrate live widgets for past sessions
}

