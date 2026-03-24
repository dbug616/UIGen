import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "@/app/main-content";

// Mock contexts
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock child components
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">HeaderActions</div>,
}));

// Mock resizable components
vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  ResizablePanel: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  ResizableHandle: () => <div data-testid="resize-handle" />,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("renders with Preview tab active by default", () => {
  render(<MainContent />);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("switches to Code view when Code tab is clicked", () => {
  render(<MainContent />);

  // Initially shows preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Click Code tab
  const codeTab = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeTab);

  // Should now show code editor, not preview
  expect(screen.queryByTestId("preview-frame")).toBeNull();
  expect(screen.getByTestId("code-editor")).toBeDefined();
});

test("switches back to Preview when Preview tab is clicked", () => {
  render(<MainContent />);

  // Switch to Code first
  const codeTab = screen.getByRole("tab", { name: "Code" });
  fireEvent.click(codeTab);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to Preview
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  fireEvent.click(previewTab);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("clicking active tab does not break the view", () => {
  render(<MainContent />);

  // Click the already-active Preview tab
  const previewTab = screen.getByRole("tab", { name: "Preview" });
  fireEvent.click(previewTab);

  // Should still show preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();
});

test("tab toggle works multiple times in sequence", () => {
  render(<MainContent />);

  const codeTab = screen.getByRole("tab", { name: "Code" });
  const previewTab = screen.getByRole("tab", { name: "Preview" });

  // Preview → Code
  fireEvent.click(codeTab);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Code → Preview
  fireEvent.click(previewTab);
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Preview → Code again
  fireEvent.click(codeTab);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Code → Preview again
  fireEvent.click(previewTab);
  expect(screen.getByTestId("preview-frame")).toBeDefined();
});
