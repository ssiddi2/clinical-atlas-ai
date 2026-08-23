import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LiveCasePanel from "./LiveCasePanel";

/** Mutable fake DB row + captured realtime handlers. */
const state: { caseRow: any; handlers: Array<(p: unknown) => void> } = { caseRow: null, handlers: [] };

vi.mock("@/integrations/supabase/client", () => {
  /** Chainable query stub that resolves to the current fake data. */
  const chain = (result: () => { data: unknown }) => {
    const obj: any = new Proxy(
      {
        then: (res: (v: unknown) => unknown) => Promise.resolve(result()).then(res),
      },
      {
        get: (target, prop) =>
          prop in target ? (target as any)[prop] : () => obj,
      },
    );
    return obj;
  };

  return {
    supabase: {
      from: (table: string) =>
        chain(() => (table === "live_cases" ? { data: state.caseRow } : { data: [] })),
      channel: () => {
        const ch: any = {
          on: (_evt: string, _cfg: unknown, cb: (p: unknown) => void) => {
            state.handlers.push(cb);
            return ch;
          },
          subscribe: () => ch,
        };
        return ch;
      },
      removeChannel: vi.fn(),
      functions: { invoke: vi.fn() },
    },
  };
});

const liveCase = {
  id: "case-1",
  classroom_id: "room-1",
  title: "Acute chest pain",
  vignette: "58-year-old with crushing chest pain.",
  steps: [
    { prompt: "Next best step?", options: ["ECG", "CT head"], correct_index: 0, explanation: "ECG first.", reveal: "ST elevation." },
  ],
  current_step_index: 0,
  revealed: false,
  status: "live",
};

describe("LiveCasePanel (student, late joiner)", () => {
  beforeEach(() => {
    state.caseRow = null;
    state.handlers = [];
  });

  it("shows the waiting state when no case exists yet", async () => {
    render(<LiveCasePanel classroomId="room-1" userId="student-1" isInstructor={false} />);
    expect(await screen.findByText(/waiting for your instructor/i)).toBeInTheDocument();
  });

  it("renders the case from a realtime event without a refresh", async () => {
    render(<LiveCasePanel classroomId="room-1" userId="student-1" isInstructor={false} />);
    await screen.findByText(/waiting for your instructor/i);

    // Instructor starts the case: row appears and realtime fires.
    state.caseRow = liveCase;
    expect(state.handlers.length).toBeGreaterThan(0);
    state.handlers.forEach((h) => h({ eventType: "INSERT" }));

    await waitFor(() => expect(screen.getByText("Acute chest pain")).toBeInTheDocument());
    expect(screen.getByText("Next best step?")).toBeInTheDocument();
    expect(screen.getByText("ECG")).toBeInTheDocument();
  });
});
