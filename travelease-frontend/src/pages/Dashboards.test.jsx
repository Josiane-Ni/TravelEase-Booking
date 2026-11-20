import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CustomerDashboard, AgentDashboard } from "./Dashboards";
import * as common from "../components/Common";
vi.mock("../context/AppContext", () => ({
  useApp: () => ({ user: { name: "Avery Traveler", role: "customer" } }),
}));
vi.mock("../components/Common", async () => {
  const actual = await vi.importActual("../components/Common");
  return { ...actual, useApi: vi.fn() };
});
beforeEach(() => cleanup());
const wrap = (component) => render(<MemoryRouter>{component}</MemoryRouter>);
describe("Data-driven dashboard states", () => {
  it("renders the loading state before API data arrives", () => {
    common.useApi.mockReturnValue({ loading: true });
    wrap(<CustomerDashboard />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
  it("shows an API error with a retry action", () => {
    common.useApi.mockReturnValue({
      loading: false,
      error: "Could not load account.",
      reload: vi.fn(),
    });
    wrap(<CustomerDashboard />);
    expect(screen.getByText("Could not load account.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
  });
  it("shows genuine empty customer data without invented trips or balance", () => {
    common.useApi.mockReturnValue({
      loading: false,
      data: {
        data: {
          metrics: {
            total_bookings: 0,
            upcoming_trips: 0,
            completed_trips: 0,
            pending_payments: 0,
            cancelled_bookings: 0,
            pending_refunds: 0,
          },
          wallet: { balance_minor: 0 },
          loyalty: { points: 0 },
          upcoming: [],
          recent_bookings: [],
          transactions: [],
          notifications: [],
        },
      },
    });
    wrap(<CustomerDashboard />);
    expect(screen.getByText("No upcoming trips")).toBeVisible();
    expect(screen.getByText("$0.00")).toBeVisible();
    expect(screen.getByText("Welcome Back, Avery! 👋")).toBeVisible();
    expect(screen.getByRole("link", { name: /Book a Hotel/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Book a Hotel/ })).toHaveAttribute("href", "/hotels");
  });
  it("renders assigned agent client records and explicitly identifies the pending group workflow", () => {
    common.useApi.mockReturnValue({
      loading: false,
      data: {
        data: {
          metrics: {
            corporate_clients: 1,
            commission_earned_minor: 0,
            commission_pending_minor: 0,
          },
          clients: {
            data: [
              {
                id: 1,
                name: "Example Corporate Client",
                contact_email: "office@example.test",
              },
            ],
          },
          commissions: { data: [] },
        },
      },
    });
    wrap(<AgentDashboard />);
    expect(screen.getByText("Example Corporate Client")).toBeVisible();
    expect(screen.getByText("Group booking workflow is pending")).toBeVisible();
  });
});
