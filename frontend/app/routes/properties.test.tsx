// frontend/app/routes/properties.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Properties from "./properties";

global.fetch = vi.fn();

describe("Properties route", () => {
  it("renders heading and input", () => {
    render(<Properties />);
    expect(screen.getByText("Property Search")).toBeTruthy();
    expect(screen.getByTestId("bbl-input")).toBeTruthy();
  });

  it("shows result on successful fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bbl: "1008350041", owners: [], message: "ok" }),
    });
    render(<Properties />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "1008350041" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("result")).toBeTruthy());
  });

  it("shows error on failed fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    render(<Properties />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("error-msg")).toBeTruthy());
  });
});
