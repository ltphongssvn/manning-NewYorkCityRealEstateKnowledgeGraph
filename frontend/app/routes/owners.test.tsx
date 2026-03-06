// frontend/app/routes/owners.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Owners, { meta } from "./owners";

global.fetch = vi.fn();

describe("Owners route", () => {
  it("meta returns correct title", () => {
    const result = meta({} as any);
    expect(result[0]).toEqual({ title: "Owners | NYC Real Estate KG" });
  });

  it("renders heading and input", () => {
    render(<Owners />);
    expect(screen.getByText("Owner Search")).toBeTruthy();
    expect(screen.getByTestId("owner-input")).toBeTruthy();
  });

  it("shows result on successful fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: "EMPIRE STATE", properties: [], message: "ok" }),
    });
    render(<Owners />);
    fireEvent.change(screen.getByTestId("owner-input"), { target: { value: "EMPIRE STATE" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("result")).toBeTruthy());
  });

  it("shows error on failed fetch", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    render(<Owners />);
    fireEvent.change(screen.getByTestId("owner-input"), { target: { value: "UNKNOWN" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("error-msg")).toBeTruthy());
  });
});
