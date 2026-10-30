import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ChatWidget } from "../ChatWidget";

// Helper to create mock ReadableStream emitting text chunks
function createMockStream(chunks: string[]) {
  const encoder = new TextEncoder();
  let idx = 0;
  return new ReadableStream({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx]));
        idx++;
      } else {
        controller.close();
      }
    },
  });
}

describe("ChatWidget Component", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders the floating button in the bottom right corner", () => {
    render(<ChatWidget />);
    const button = screen.getByRole("button", { name: /open ai chat assistant/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("fixed");
    expect(button.className).toContain("bottom-6");
    expect(button.className).toContain("right-6");
  });

  it("opens slide-up chat panel with dark glassmorphic styling when clicked", async () => {
    render(<ChatWidget />);
    const toggleButton = screen.getByRole("button", { name: /open ai chat assistant/i });
    fireEvent.click(toggleButton);

    const panel = screen.getByRole("complementary", { name: /orbit ai chat assistant/i });
    expect(panel).toBeInTheDocument();

    // Check dark glassmorphic styling
    expect(panel.className).toContain("bg-[#0A0A0F]/90");
    expect(panel.className).toContain("backdrop-blur-xl");
    expect(panel.className).toContain("border-white/10");

    // Check header elements
    expect(screen.getByText("ORBIT Copilot")).toBeInTheDocument();
    expect(screen.getByText("Gemini 2.0")).toBeInTheDocument();

    // Check input and send button
    expect(screen.getByPlaceholderText(/ask your ai copilot anything/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("streams AI response word-by-word using response.body.getReader() and TextDecoder", async () => {
    const chunks = ["Hello ", "founder! ", "I ", "can ", "validate ", "your ", "idea."];
    let requestCaptured: { url: string; body: any } | null = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, options: any) => {
      requestCaptured = { url, body: JSON.parse(options.body) };
      return new Response(createMockStream(chunks), {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    });

    render(<ChatWidget />);
    // Open chat
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    const sendButton = screen.getByRole("button", { name: /send message/i });

    // Type message
    fireEvent.change(textarea, { target: { value: "How do I validate my SaaS?" } });
    expect(textarea).toHaveValue("How do I validate my SaaS?");

    // Send
    await act(async () => {
      fireEvent.click(sendButton);
    });

    // 1. User message appears immediately
    expect(screen.getByText("How do I validate my SaaS?")).toBeInTheDocument();

    // 2. Fetch was called with correct endpoint and payload
    expect(requestCaptured).not.toBeNull();
    expect(requestCaptured!.url).toBe("http://localhost:8000/api/chat");
    expect(requestCaptured!.body.message).toBe("How do I validate my SaaS?");
    expect(requestCaptured!.body.history).toEqual([]);

    // 3. AI streamed response appears chunk-by-chunk and resolves completely
    await waitFor(() => {
      expect(screen.getByText(/Hello founder! I can validate your idea\./i)).toBeInTheDocument();
    });
  });

  it("handles multi-turn conversation and passes prior history to backend", async () => {
    let callCount = 0;
    const historyCalls: any[] = [];

    global.fetch = vi.fn().mockImplementation(async (_url: string, options: any) => {
      callCount++;
      const parsed = JSON.parse(options.body);
      historyCalls.push(parsed);

      const responseText = callCount === 1 ? "Turn 1 response." : "Turn 2 response.";
      return new Response(createMockStream([responseText]), {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);

    // Turn 1
    fireEvent.change(textarea, { target: { value: "Turn 1 question" } });
    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    });

    await waitFor(() => {
      expect(screen.getByText(/Turn 1 response\./i)).toBeInTheDocument();
    });

    expect(historyCalls[0].message).toBe("Turn 1 question");
    expect(historyCalls[0].history).toEqual([]);

    // Turn 2
    fireEvent.change(textarea, { target: { value: "Turn 2 question" } });
    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    });

    await waitFor(() => {
      expect(screen.getByText(/Turn 2 response\./i)).toBeInTheDocument();
    });

    expect(historyCalls[1].message).toBe("Turn 2 question");
    expect(historyCalls[1].history.length).toBe(2);
    expect(historyCalls[1].history[0].role).toBe("user");
    expect(historyCalls[1].history[0].content).toBe("Turn 1 question");
    expect(historyCalls[1].history[1].role).toBe("model");
    expect(historyCalls[1].history[1].content).toBe("Turn 1 response.");
  });

  it("handles HTTP error states gracefully", async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response("Internal Server Error: Database Down", {
        status: 500,
        statusText: "Internal Server Error",
      });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Will this fail?" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    // Error banner and bubble should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Stream Connection Error/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Server returned 500/i).length).toBeGreaterThan(0);
    });
  });

  it("handles network disconnection or fetch reject gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Testing network failure" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Stream Connection Error/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Failed to fetch/i).length).toBeGreaterThan(0);
    });
  });

  it("supports clicking a suggested starter prompt", async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response(createMockStream(["Here is your MVP architecture plan."]), {
        status: 200,
      });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const starterButton = screen.getByText(/🏗️ Recommend MVP architecture/i);
    await act(async () => {
      fireEvent.click(starterButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Here is your MVP architecture plan\./i)).toBeInTheDocument();
    });
  });

  it("allows clearing conversation history", async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response(createMockStream(["Some message"]), { status: 200 });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Some message")).toBeInTheDocument();
    });

    // Clear chat
    const clearButton = screen.getByRole("button", { name: /clear conversation/i });
    fireEvent.click(clearButton);

    // Message should no longer be in the document
    expect(screen.queryByText("Some message")).not.toBeInTheDocument();
    expect(screen.getByText(/How can I help your startup\?/i)).toBeInTheDocument();
  });

  it("does not submit empty or whitespace-only message", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    const sendButton = screen.getByRole("button", { name: /send message/i });

    expect(sendButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: "   " } });
    expect(sendButton).toBeDisabled();

    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not submit when Shift+Enter is pressed", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Line 1" } });

    await act(async () => {
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("aborts active stream cleanly when stop button is clicked", async () => {
    let cancelCalled = false;
    const endlessStream = new ReadableStream({
      start() {},
      cancel() {
        cancelCalled = true;
      },
    });

    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response(endlessStream, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Generate a long essay" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    // The stop button should now appear
    const stopButton = screen.getByRole("button", { name: /stop generation/i });
    expect(stopButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(stopButton);
    });

    // Stop button should disappear and send button reappear
    expect(screen.queryByRole("button", { name: /stop generation/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    expect(screen.queryByText(/Stream Connection Error/i)).not.toBeInTheDocument();
  });

  it("extracts FastAPI detail field cleanly from JSON error responses", async () => {
    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ detail: "🛑 API KEY REQUIRED: Missing valid key." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Test error parsing" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    await waitFor(() => {
      expect(screen.getAllByText(/🛑 API KEY REQUIRED: Missing valid key\./i).length).toBeGreaterThan(0);
    });
  });

  it("removes empty AI placeholder bubble when aborted before any chunk arrives", async () => {
    const endlessStream = new ReadableStream({
      start() {},
    });

    global.fetch = vi.fn().mockImplementation(async () => {
      return new Response(endlessStream, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);
    fireEvent.change(textarea, { target: { value: "Abort immediately" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    const stopButton = screen.getByRole("button", { name: /stop generation/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // The empty model placeholder should be removed, leaving only the user message
    expect(screen.getByText("Abort immediately")).toBeInTheDocument();
    // No empty model bubble or error message
    expect(screen.queryByText(/Chat Error/i)).not.toBeInTheDocument();
  });

  it("sanitizes history when consecutive user messages occur", async () => {
    const payloads: any[] = [];
    let turn = 0;

    global.fetch = vi.fn().mockImplementation(async (_url: string, options: any) => {
      turn++;
      payloads.push(JSON.parse(options.body));
      if (turn === 1) {
        // Return endless stream that gets aborted before answering
        return new Response(new ReadableStream({ start() {} }), { status: 200 });
      }
      return new Response(createMockStream(["Answer to turn 2"]), { status: 200 });
    });

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /open ai chat assistant/i }));

    const textarea = screen.getByPlaceholderText(/ask your ai copilot anything/i);

    // Turn 1: user sends, then stops before model outputs
    fireEvent.change(textarea, { target: { value: "Turn 1 aborted" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    const stopBtn = screen.getByRole("button", { name: /stop generation/i });
    await act(async () => {
      fireEvent.click(stopBtn);
    });

    // Turn 2: user sends a new message
    fireEvent.change(textarea, { target: { value: "Turn 2 message" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Answer to turn 2")).toBeInTheDocument();
    });

    // Verify sanitized history for turn 2 does NOT send consecutive user roles to backend
    expect(payloads[1].message).toBe("Turn 2 message");
    // Since Turn 1 had no model response, history must not end with a user role
    expect(payloads[1].history).toEqual([]);
  });
});
