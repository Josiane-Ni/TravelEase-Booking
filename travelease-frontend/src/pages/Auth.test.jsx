import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthPage, PasswordRecovery, registrationSchema } from "./Auth";
import { Protected } from "../components/Layout";
const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  notify: vi.fn(),
  user: null,
  booting: false,
  toggleTheme: vi.fn(),
}));
vi.mock("../context/AppContext", () => ({
  useApp: () => ({ ...mocks, mode: "light" }),
}));
beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.user = null;
  mocks.booting = false;
});
const form = {
  name: "Avery Traveler",
  phone: "+250788123456",
  email: "avery@example.test",
  password: "Secure!Pass123",
  password_confirmation: "Secure!Pass123",
  terms: true,
};
describe("Registration validation", () => {
  it("rejects passwords that do not satisfy the backend rules", () => {
    expect(
      registrationSchema.safeParse({
        ...form,
        password: "password",
        password_confirmation: "password",
      }).success,
    ).toBe(false);
  });
  it("requires matching confirmation and accepted terms", () => {
    expect(
      registrationSchema.safeParse({
        ...form,
        password_confirmation: "Other!Pass123",
      }).success,
    ).toBe(false);
    expect(
      registrationSchema.safeParse({ ...form, terms: false }).success,
    ).toBe(false);
  });
  it("accepts valid customer details and normalizes email", () => {
    const result = registrationSchema.parse({
      ...form,
      email: "AVERY@EXAMPLE.TEST",
    });
    expect(result.email).toBe("avery@example.test");
  });
});
describe("Login interface", () => {
  it("keeps invalid input from submitting credentials", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );
    await user.click(
      screen.getByRole("button", { name: "Login", exact: true }),
    );
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeVisible();
    expect(mocks.login).not.toHaveBeenCalled();
  });
  it("shows server validation failures and allows a password visibility toggle", async () => {
    const user = userEvent.setup();
    mocks.login.mockRejectedValue({
      response: {
        data: {
          message: "The credentials are invalid.",
          errors: { email: ["The credentials are invalid."] },
        },
      },
    });
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );
    const pw = screen.getByLabelText("Password", { exact: true });
    await user.type(
      screen.getByLabelText("Email Address"),
      "avery@example.test",
    );
    await user.type(pw, "Secure!Pass123");
    expect(pw).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(pw).toHaveAttribute("type", "text");
    await user.click(
      screen.getByRole("button", { name: "Login", exact: true }),
    );
    await waitFor(() => expect(mocks.login).toHaveBeenCalledTimes(1));
    expect(
      (await screen.findAllByText("The credentials are invalid.")).length,
    ).toBeGreaterThan(0);
  }, 15000);
  it("requires terms agreement before attempting registration", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthPage registerMode />
      </MemoryRouter>,
    );
    await user.click(
      screen.getByRole("button", { name: "Register", exact: true }),
    );
    expect(
      await screen.findByText("Accept the terms to continue."),
    ).toBeVisible();
    expect(mocks.register).not.toHaveBeenCalled();
  });
});
describe("Protected routes", () => {
  it("does not render private content for a mismatched role", () => {
    mocks.user = { role: "customer" };
    render(
      <MemoryRouter>
        <Protected role="admin">
          <span>Private admin data</span>
        </Protected>
      </MemoryRouter>,
    );
    expect(screen.queryByText("Private admin data")).not.toBeInTheDocument();
  });
  it("renders private content for the authenticated owner role", () => {
    mocks.user = { role: "customer" };
    render(
      <MemoryRouter>
        <Protected role="customer">
          <span>My dashboard</span>
        </Protected>
      </MemoryRouter>,
    );
    expect(screen.getByText("My dashboard")).toBeVisible();
  });
});

describe("Password reset validation", () => {
  it("rejects weak new credentials before making a reset request", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          "/reset-password?email=avery@example.test&token=test-token",
        ]}
      >
        <PasswordRecovery reset />
      </MemoryRouter>,
    );
    await user.type(
      screen.getByLabelText("New Password", { exact: true }),
      "password",
    );
    await user.type(
      screen.getByLabelText("Confirm Password", { exact: true }),
      "password",
    );
    await user.click(
      screen.getByRole("button", { name: "Reset password", exact: true }),
    );
    expect(
      await screen.findByText("Include an uppercase letter."),
    ).toBeVisible();
  });
});
