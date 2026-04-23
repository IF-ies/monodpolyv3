import { NextResponse } from "next/server";

type ContestState = {
  started: boolean;
  startedAt: number | null;
  readyParticipants: string[];
  hostAddress: string | null;
  minParticipants: number;
  targetParticipants: number;
  countdownStartedAt: number | null;
  countdownSeconds: number;
};
const JOIN_WINDOW_SECONDS = 10;

type ParticipantStore = {
  participants: string[];
};

declare global {
  // eslint-disable-next-line no-var
  var __contestStateStore: ContestState | undefined;
  // eslint-disable-next-line no-var
  var __contestStore: ParticipantStore | undefined;
}

const getContestState = (): ContestState => {
  if (!global.__contestStateStore) {
    global.__contestStateStore = {
      started: false,
      startedAt: null,
      readyParticipants: [],
      hostAddress: null,
      minParticipants: 2,
      targetParticipants: 2,
      countdownStartedAt: null,
      countdownSeconds: 5,
    };
  }
  return global.__contestStateStore;
};

const getParticipants = (): string[] => {
  return global.__contestStore?.participants ?? [];
};

const advanceContestState = (store: ContestState, participants: string[]) => {
  if (store.started) return;

  if (participants.length === 0) {
    store.countdownStartedAt = null;
    store.readyParticipants = [];
    store.countdownSeconds = JOIN_WINDOW_SECONDS;
    return;
  }

  if (!store.countdownStartedAt) {
    store.countdownStartedAt = Date.now();
    store.countdownSeconds = JOIN_WINDOW_SECONDS;
  }

  const elapsedSeconds = Math.floor((Date.now() - store.countdownStartedAt) / 1000);
  if (elapsedSeconds >= store.countdownSeconds) {
    store.started = true;
    store.startedAt = Date.now();
    store.countdownStartedAt = null;
  }
};

export async function GET() {
  const store = getContestState();
  const participants = getParticipants();
  advanceContestState(store, participants);
  return NextResponse.json(store);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    started?: boolean;
    startedAt?: number | null;
    readyAddress?: string;
    isReady?: boolean;
    hostAddress?: string;
    minParticipants?: number;
    targetParticipants?: number;
    startRequest?: boolean;
  };
  const store = getContestState();

  const participants = getParticipants();
  const readyAddress = body.readyAddress?.toLowerCase().trim();

  if (readyAddress && typeof body.isReady === "boolean") {
    if (body.isReady) {
      if (!store.readyParticipants.includes(readyAddress)) {
        store.readyParticipants.push(readyAddress);
      }
    } else {
      store.readyParticipants = store.readyParticipants.filter(item => item !== readyAddress);
    }
  }

  // Keep ready list normalized and unique even when requests arrive close together.
  store.readyParticipants = [
    ...new Set(store.readyParticipants.map(item => item.toLowerCase().trim()).filter(Boolean)),
  ];

  if (body.hostAddress) {
    store.hostAddress = body.hostAddress.toLowerCase().trim();
  }
  if (typeof body.minParticipants === "number") {
    store.minParticipants = Math.max(2, Math.floor(body.minParticipants));
  }
  if (typeof body.targetParticipants === "number") {
    store.targetParticipants = Math.max(store.minParticipants, Math.floor(body.targetParticipants));
  }

  if (typeof body.started === "boolean") {
    store.started = body.started;
    if (!body.started) {
      store.readyParticipants = [];
      store.startedAt = null;
      store.hostAddress = null;
      store.minParticipants = 2;
      store.targetParticipants = 2;
      store.countdownStartedAt = null;
      store.countdownSeconds = JOIN_WINDOW_SECONDS;
    }
  }
  if (typeof body.startedAt === "number" || body.startedAt === null) {
    store.startedAt = body.startedAt;
  }

  advanceContestState(store, participants);

  if (body.startRequest && participants.length > 0 && !store.started) {
    store.started = true;
    store.startedAt = Date.now();
    store.countdownStartedAt = null;
  }

  return NextResponse.json(store);
}
