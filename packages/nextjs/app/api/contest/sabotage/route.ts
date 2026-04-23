import { NextResponse } from "next/server";

type SabotageType = "freeze" | "shorten" | "hide";

type SabotageEvent = {
  id: number;
  type: SabotageType;
  from: string;
  amount: number;
  createdAt: number;
};

type SabotageStore = {
  events: SabotageEvent[];
  nextId: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __contestSabotageStore: SabotageStore | undefined;
}

const getStore = (): SabotageStore => {
  if (!global.__contestSabotageStore) {
    global.__contestSabotageStore = { events: [], nextId: 1 };
  }
  return global.__contestSabotageStore;
};

export async function GET() {
  return NextResponse.json(getStore());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    type?: SabotageType;
    from?: string;
    amount?: number;
  };
  const type = body.type;
  const from = body.from?.toLowerCase().trim();
  const amount = typeof body.amount === "number" ? body.amount : 0;

  if (!type || !from || amount <= 0) {
    return NextResponse.json({ error: "Invalid sabotage payload" }, { status: 400 });
  }

  const store = getStore();
  const event: SabotageEvent = {
    id: store.nextId++,
    type,
    from,
    amount,
    createdAt: Date.now(),
  };
  store.events.push(event);

  return NextResponse.json({ event, events: store.events, nextId: store.nextId });
}

export async function DELETE() {
  global.__contestSabotageStore = { events: [], nextId: 1 };
  return NextResponse.json(global.__contestSabotageStore);
}
