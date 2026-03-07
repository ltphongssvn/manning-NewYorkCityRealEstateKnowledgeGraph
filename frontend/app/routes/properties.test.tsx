// frontend/app/routes/properties.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Properties, { meta } from "./properties";

global.fetch = vi.fn();

describe("Properties route", () => {
  it("meta returns correct title", () => {
    const result = meta({} as any);
    expect(result[0]).toEqual({ title: "Properties | NYC Real Estate KG" });
  });

  it("renders heading and input", () => {
    render(<Properties />);
    expect(screen.getByText("Property Search")).toBeTruthy();
    expect(screen.getByTestId("bbl-input")).toBeTruthy();
  });

  it("shows owner name and address on successful fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bbl: "1008350041",
        owners: [{ name: "ESRT EMPIRE STATE BUILDING, L.L.C.", address: "5 AVENUE", relationship: "TAX_ASSESSOR_OWNER" }],
      }),
    });
    render(<Properties />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "1008350041" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("result")).toBeTruthy());
    expect(screen.getByText("ESRT EMPIRE STATE BUILDING, L.L.C.")).toBeTruthy();
  });

  it("shows error on failed fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    render(<Properties />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("error-msg")).toBeTruthy());
  });
});
