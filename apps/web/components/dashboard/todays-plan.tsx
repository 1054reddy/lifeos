"use client";

import {
  Check,
  Clock3,
  Coffee,
  Focus,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  completePlannerBlock,
  getUserPlannerBlocks,
  type PlannerBlock,
} from "@/lib/api";

const blockTypeIcons = {
  task: Check,
  focus: Focus,
  break: Coffee,
  personal: UserRound,
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TodaysPlan() {
  const [blocks, setBlocks] = useState<PlannerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingBlockId, setCompletingBlockId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadPlan() {
      try {
        const data = await getUserPlannerBlocks(formatDate(new Date()));
        setBlocks(data);
      } catch {
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, []);

  async function handleComplete(blockId: string) {
    try {
      setCompletingBlockId(blockId);

      const updatedBlock = await completePlannerBlock(blockId);

      setBlocks((currentBlocks) =>
        currentBlocks.map((block) =>
          block.id === blockId ? updatedBlock : block,
        ),
      );
    } catch {
      // Keep the current Dashboard state if completion fails.
    } finally {
      setCompletingBlockId(null);
    }
  }

  return (
    <section className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Clock3 className="size-4" />
          </div>

          <div>
            <h2 className="font-semibold">Today&apos;s Plan</h2>
            <p className="text-xs text-muted-foreground">
              Your planned time blocks
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Loading plan...
        </div>
      )}

      {!loading && blocks.length === 0 && (
        <div className="px-5 py-8 text-center">
          <Clock3 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            No plan for today
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add time blocks from Planner to structure your day.
          </p>
        </div>
      )}

      {!loading && blocks.length > 0 && (
        <div className="divide-y">
          {blocks.map((block) => {
            const Icon =
              blockTypeIcons[block.block_type] ?? Clock3;

            return (
              <div
                key={block.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="w-20 shrink-0 text-xs text-muted-foreground">
                  <div>{formatTime(block.start_time)}</div>
                  <div className="mt-0.5">
                    {formatTime(block.end_time)}
                  </div>
                </div>

                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                    block.is_completed
                      ? "bg-foreground text-background"
                      : "bg-muted"
                  }`}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      block.is_completed
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {block.title}
                  </p>

                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {block.block_type}
                  </p>
                </div>

                {!block.is_completed && (
                  <button
                    type="button"
                    onClick={() => handleComplete(block.id)}
                    disabled={completingBlockId === block.id}
                    className="shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
                  >
                    Complete
                  </button>
                )}

                {block.is_completed && (
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}