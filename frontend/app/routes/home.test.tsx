// frontend/app/routes/home.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home, { meta } from "./home";

describe("Home route", () => {
  it("meta returns correct title", () => {
    const result = meta({} as any);
    expect(result[0]).toEqual({ title: "NYC Real Estate Knowledge Graph" });
  });

  it("renders all 4 nav links", () => {
    render(<Home />);
    expect(screen.getByText("Properties")).toBeTruthy();
    expect(screen.getByText("Owners")).toBeTruthy();
    expect(screen.getByText("Graph Explorer")).toBeTruthy();
    expect(screen.getByText("Recommendations")).toBeTruthy();
  });

  it("renders heading", () => {
    render(<Home />);
    expect(screen.getByText("NYC Real Estate Knowledge Graph")).toBeTruthy();
  });
});
