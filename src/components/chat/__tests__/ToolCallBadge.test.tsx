import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result",
  result: unknown = "Success"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "test-id", toolName, args, state, result } as ToolInvocation;
  }
  return { toolCallId: "test-id", toolName, args, state } as ToolInvocation;
}

test("str_replace_editor create shows 'Creating {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.jsx" })}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows 'Editing {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/components/Button.jsx" })}
    />
  );
  expect(screen.getByText("Editing Button.jsx")).toBeDefined();
});

test("str_replace_editor insert shows 'Editing {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "src/utils.ts" })}
    />
  );
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("str_replace_editor view shows 'Viewing {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "src/index.tsx" })}
    />
  );
  expect(screen.getByText("Viewing index.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows 'Undoing edit in {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" })}
    />
  );
  expect(screen.getByText("Undoing edit in App.tsx")).toBeDefined();
});

test("file_manager rename shows 'Renaming {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", { command: "rename", path: "src/oldFile.tsx", new_path: "src/newFile.tsx" })}
    />
  );
  expect(screen.getByText("Renaming oldFile.tsx")).toBeDefined();
});

test("file_manager delete shows 'Deleting {filename}'", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("file_manager", { command: "delete", path: "src/Card.tsx" })}
    />
  );
  expect(screen.getByText("Deleting Card.tsx")).toBeDefined();
});

test("in-progress state shows spinner, not green dot", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "App.jsx" }, "call")}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("completed state shows green dot, not spinner", () => {
  const { container } = render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "App.jsx" }, "result", "ok")}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("empty args falls back to raw toolName", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("str_replace_editor", {})}
    />
  );
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("unknown tool falls back to raw toolName", () => {
  render(
    <ToolCallBadge
      toolInvocation={makeInvocation("some_unknown_tool", { path: "foo.ts" })}
    />
  );
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});
