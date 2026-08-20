/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useId } from "react";
import { QuestionComponentProps } from "@/types/attempt";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

export const OrderingQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<any>) => {
  const droppableId = useId();

  const rawItems: string[] = (question.config?.items ?? []).map((it: any) =>
    typeof it === "string" ? it : it?.text ?? "",
  );

  // The student's working order is an array of item texts.
  const order: string[] =
    Array.isArray(userAnswer) && userAnswer.length ? userAnswer : rawItems;

  // Seed the answer with the initial (shuffled) order so an untouched submit still sends a full array.
  useEffect(() => {
    if (!Array.isArray(userAnswer) || userAnswer.length === 0) {
      setAnswer(rawItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (i: number, dir: -1 | 1) => {
    if (submitted) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setAnswer(next);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || submitted) return;
    if (result.destination.index === result.source.index) return;

    const items = Array.from(order);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setAnswer(items);
  };

  return (
    <div className="space-y-4">
      {/* Question Prompt */}
      {question.config?.question && (
        <div 
          className="text-base font-semibold leading-relaxed text-slate-900 prose prose-slate max-w-none prose-p:my-0 break-words"
          dangerouslySetInnerHTML={{ __html: (question.config.question || "").replace(/&nbsp;/g, ' ') }}
        />
      )}
      <p className="text-xs text-slate-500">
        Grab and drag items into the correct order, or use the arrows.
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {order.map((item, i) => (
                <Draggable
                  key={`item-${i}-${item.substring(0, 15)}`}
                  draggableId={`draggable-${i}-${item.substring(0, 15)}`}
                  index={i}
                  isDragDisabled={submitted}
                >
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 transition-shadow select-none",
                        snapshot.isDragging
                          ? "border-blue-400 shadow-md ring-2 ring-blue-400/20 bg-blue-50/30 z-50"
                          : "border-slate-200 shadow-2xs hover:border-slate-300"
                      )}
                    >
                      {/* Drag Grip Handle */}
                      <div
                        {...dragProvided.dragHandleProps}
                        className={cn(
                          "p-1 -ml-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0",
                          submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                        )}
                        title="Grab and drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Step Number Badge */}
                      <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>

                      {/* Text */}
                      <span className="flex-1 text-xs font-medium text-slate-800 break-words">
                        {item}
                      </span>

                      {/* Optional Arrow Controls */}
                      {!submitted && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-lg cursor-pointer"
                            disabled={submitted || i === 0}
                            onClick={() => move(i, -1)}
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-lg cursor-pointer"
                            disabled={submitted || i === order.length - 1}
                            onClick={() => move(i, 1)}
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
