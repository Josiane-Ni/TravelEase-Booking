import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HotelManagement } from "./Management";
import { AppProvider } from "../context/AppContext";

vi.mock("../services/api", async () => {
  const actual = await vi.importActual("../services/api");
  return {
    ...actual,
    api: {
      get: vi.fn().mockResolvedValue({
        data: {
          data: [
            {
              id: 1,
              name: "Kigali Serena Hotel",
              city: "Kigali",
              address: "KN 3 Ave, Kigali",
              stars: 5,
              cancellation_hours: 48,
              cancellation_fee_percent: 15,
              status: "active",
              room_types: [
                { id: 101, name: "Deluxe King", price_per_night_minor: 22000, capacity: 2, total_rooms: 12 },
              ],
            },
          ],
          meta: { current_page: 1, last_page: 1, total: 1 },
        },
      }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
    },
  };
});

describe("HotelManagement Page Component", () => {
  it("renders hotel management table without crashing or white screen", async () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <HotelManagement />
        </AppProvider>
      </MemoryRouter>
    );

    // Initial heading should be visible immediately
    expect(screen.getByText("Hotel Management")).toBeInTheDocument();
    expect(screen.getByText("Add Hotel")).toBeInTheDocument();

    // After async mock resolution, the seeded hotel name should appear
    expect(await screen.findByText("Kigali Serena Hotel")).toBeInTheDocument();
    expect(screen.getByText("Rooms (1)")).toBeInTheDocument();
  });
});
