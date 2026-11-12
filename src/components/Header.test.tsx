/**
 * @vitest-environment jsdom
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";

const { useAuthMock, useCartMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  useCartMock: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

vi.mock("../hooks/useCart", () => ({
  useCart: useCartMock,
}));

import { Header } from "./Header";

const testUser = { uid: "test-user" };
const onToggleTheme = vi.fn();

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header
        theme="light"
        onToggleTheme={onToggleTheme}
      />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  useAuthMock.mockReturnValue({
    user: null,
    profile: null,
    loading: false,
  });

  useCartMock.mockReturnValue({
    totalUnits: 2,
  });
});

afterEach(() => {
  cleanup();
});

describe("Header", () => {
  it("muestra Login y Registro al visitante", () => {
    renderHeader();

    expect(
      screen.getByRole("link", {
        name: "Iniciar sesión",
      }).getAttribute("href"),
    ).toBe("/login");

    expect(
      screen.getByRole("link", {
        name: "Registrarse",
      }).getAttribute("href"),
    ).toBe("/register");

    expect(
      screen.queryByRole("link", {
        name: "Administración",
      }),
    ).toBeNull();
  });

  it("muestra las opciones de cliente autenticado", () => {
    useAuthMock.mockReturnValue({
      user: testUser,
      profile: { role: "customer" },
      loading: false,
    });

    renderHeader();

    expect(
      screen.getByRole("link", {
        name: "Favoritos",
      }).getAttribute("href"),
    ).toBe("/favoritos");

    expect(
      screen.getByRole("link", {
        name: "Mis órdenes",
      }).getAttribute("href"),
    ).toBe("/mis-ordenes");

    expect(
      screen.queryByRole("link", {
        name: "Iniciar sesión",
      }),
    ).toBeNull();

    expect(
      screen.queryByRole("link", {
        name: "Administración",
      }),
    ).toBeNull();
  });

  it("muestra el acceso administrativo solo al admin", () => {
    useAuthMock.mockReturnValue({
      user: testUser,
      profile: { role: "admin" },
      loading: false,
    });

    renderHeader();

    expect(
      screen.getByRole("link", {
        name: "Administración",
      }).getAttribute("href"),
    ).toBe("/admin");

    expect(
      screen.queryByRole("link", {
        name: "Registrarse",
      }),
    ).toBeNull();
  });

  it("no muestra enlaces de sesión durante la carga", () => {
    useAuthMock.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
    });

    renderHeader();

    expect(
      screen.queryByRole("link", {
        name: "Iniciar sesión",
      }),
    ).toBeNull();

    expect(
      screen.queryByRole("link", {
        name: "Registrarse",
      }),
    ).toBeNull();
  });

  it("permite cambiar el tema", () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Modo oscuro",
      }),
    );

    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});
