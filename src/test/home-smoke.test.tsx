import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";

// ── Mocks ──
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          gte: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
          order: (c: string, o?: any) => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
        gte: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        limit: () => Promise.resolve({ data: [], error: null }),
        then: (cb: any) => Promise.resolve({ data: [], error: null }).then(cb),
      }),
    }),
  },
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", email: "test@test.com" }, profile: { first_name: "Test" } }),
}));
vi.mock("@/components/MobileLayout", () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock("@/components/BottomNav", () => ({ default: () => <nav /> }));
vi.mock("@/components/WelcomeModal", () => ({ default: () => <div /> }));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));

import { LanguageProvider } from "@/i18n/LanguageContext";
import Home from "@/pages/Home";

describe("Home smoke", () => {
  it("renders without crashing", async () => {
    const { container } = render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>
    );
    await waitFor(() => expect(container.textContent).toContain("bouger"), { timeout: 3000 });
  });
});
