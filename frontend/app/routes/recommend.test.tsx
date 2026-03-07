// frontend/app/routes/recommend.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Recommend, { meta } from "./recommend";

global.fetch = vi.fn();

describe("Recommend route", () => {
  it("meta returns correct title", () => {
    const result = meta({} as any);
    expect(result[0]).toEqual({ title: "Recommendations | NYC Real Estate KG" });
  });

  it("renders heading and input", () => {
    render(<Recommend />);
    expect(screen.getByText("Similar Property Recommendations")).toBeTruthy();
    expect(screen.getByTestId("bbl-input")).toBeTruthy();
  });

  it("shows ranked recommendations on successful fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bbl: "1008350041",
        recommendations: [
          { bbl: "1008597501", distance: 0.2755 },
          { bbl: "1010431132", distance: 0.2866 },
        ],
      }),
    });
    render(<Recommend />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "1008350041" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("result")).toBeTruthy());
    expect(screen.getByText("1008597501")).toBeTruthy();
  });

  it("shows error on failed fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    render(<Recommend />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("error-msg")).toBeTruthy());
  });
});
