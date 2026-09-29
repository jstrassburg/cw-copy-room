import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

const audioMocks = vi.hoisted(() => ({
  play: vi.fn().mockResolvedValue(0),
  stop: vi.fn(),
}));

vi.mock("./hooks/useAudioEngine", () => ({
  useAudioEngine: () => ({ status: "idle", error: "", ...audioMocks }),
}));

describe("App", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens directly on the practice surface", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /which character/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play morse audio/i })).toBeInTheDocument();
    expect(screen.getByText("12 WPM", { exact: false })).toBeInTheDocument();
  });

  it("switches mode and starts a fresh session", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("tab", { name: /cw terms/i }));
    expect(screen.getByRole("heading", { name: /which term/i })).toBeInTheDocument();
    expect(screen.getByText("Attempts").nextSibling).toHaveTextContent("0");
  });

  it("uses consecutive Enter presses to grade, advance, and play", () => {
    render(<App />);
    const answer = screen.getByLabelText("Your answer");

    fireEvent.change(answer, { target: { value: "A" } });
    fireEvent.submit(answer.closest("form")!);
    const next = screen.getByRole("button", { name: /next item \+ play/i });
    expect(next).toHaveFocus();

    fireEvent.click(next);
    expect(audioMocks.play).toHaveBeenCalledTimes(1);
  });
});
