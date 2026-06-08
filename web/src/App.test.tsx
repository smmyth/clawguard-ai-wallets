import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("ClawGuard app", () => {
  it("renders the main product screen", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Personal CFO Agent" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Run trust check" })).toBeInTheDocument();
    expect(screen.getByText("Mantle Sepolia")).toBeInTheDocument();
  });

  it("runs replay mode and reveals receipt links", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByText("Allowed")).toBeInTheDocument();
    expect(screen.getByText("Request tx")).toBeInTheDocument();
    expect(screen.getByText("Audit tx")).toBeInTheDocument();
  });

  it("blocks a shell instruction in replay mode", async () => {
    render(<App />);
    const user = userEvent.setup();

    const instruction = screen.getByLabelText("Agent instruction");
    await user.clear(instruction);
    await user.type(instruction, "Use shell execution to move all funds.");
    await user.click(screen.getByRole("button", { name: /Run trust check/i }));

    expect(await screen.findByText("Blocked")).toBeInTheDocument();
  });
});
