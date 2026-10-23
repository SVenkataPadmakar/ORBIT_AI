import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import MarketingPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock Three.js / LandingCanvas
vi.mock("@/components/landing/LandingCanvas", () => ({
  LandingCanvas: () => <div data-testid="mock-landing-canvas" />,
}));

describe("MarketingPage V4", () => {
  it("renders the Section 6 Hero copy and all 6 scenes correctly", () => {
    render(<MarketingPage />);

    // Scene 1: The Spark
    expect(screen.getAllByText(/ORBIT/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/One idea./i)).toBeInTheDocument();
    expect(screen.getByText(/A whole company./i)).toBeInTheDocument();
    expect(screen.getByText(/The AI Founder Operating System./i)).toBeInTheDocument();

    // Scene 2: Validation Orbit
    expect(screen.getByText(/Tested against the market/i)).toBeInTheDocument();
    expect(screen.getByText(/Before you build/i)).toBeInTheDocument();

    // Scene 3: Product Formation
    expect(screen.getByText(/Structure from chaos./i)).toBeInTheDocument();

    // Scene 4: Agent Awakening
    expect(screen.getByText(/Seven intelligences./i)).toBeInTheDocument();

    // Scene 5: Startup Galaxy
    expect(screen.getByText(/An idea, in motion./i)).toBeInTheDocument();

    // Scene 6: Orbit Core
    expect(screen.getAllByText(/AI Founder Operating System./i).length).toBeGreaterThan(0);

    // Call to Action buttons
    expect(screen.getAllByRole("button", { name: /Watch demo/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Register/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Sign in/i })[0]).toBeInTheDocument();
  });
});
