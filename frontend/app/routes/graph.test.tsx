// frontend/app/routes/graph.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Graph, { meta } from "./graph";

global.fetch = vi.fn();

describe("Graph route", () => {
  it("meta returns correct title", () => {
    const result = meta({} as any);
    expect(result[0]).toEqual({ title: "Graph Explorer | NYC Real Estate KG" });
  });

  it("renders heading and input", () => {
    render(<Graph />);
    expect(screen.getByText("Graph Explorer")).toBeTruthy();
    expect(screen.getByTestId("bbl-input")).toBeTruthy();
  });

  it("shows nodes and edges on successful traverse", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        bbl: "1008350041",
        nodes: [
          { id: "1", labels: ["BBL"], properties: { bbl: "1008350041", address: "5 AVENUE" } },
          { id: "2", labels: ["OWNER"], properties: { name: "ESRT EMPIRE STATE BUILDING, L.L.C." } },
        ],
        edges: [{ id: "1", type: "TAX_ASSESSOR_OWNER", start: "2", end: "1" }],
      }),
    });
    render(<Graph />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "1008350041" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("result")).toBeTruthy());
    expect(screen.getByText("ESRT EMPIRE STATE BUILDING, L.L.C.")).toBeTruthy();
  });

  it("shows error on failed traverse", async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false });
    render(<Graph />);
    fireEvent.change(screen.getByTestId("bbl-input"), { target: { value: "bad" } });
    fireEvent.submit(screen.getByRole("button"));
    await waitFor(() => expect(screen.getByTestId("error-msg")).toBeTruthy());
  });
});
