/**
 * @vitest-environment jsdom
 */

import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";
import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router";
import { AdminLayout } from "./AdminLayout";

afterEach(() => {
  cleanup();
});

describe("AdminLayout", () => {
  it("muestra la navegación y el contenido administrativo", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<h1>Contenido de prueba</h1>}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("navigation", {
        name: "Navegación administrativa",
      }),
    ).toBeTruthy();

    expect(
      screen.getByRole("link", {
        name: "Panel",
      }).getAttribute("href"),
    ).toBe("/admin");

    expect(
      screen.getByRole("link", {
        name: "Ver tienda",
      }).getAttribute("href"),
    ).toBe("/catalogo");

    expect(
      screen.getByRole("heading", {
        name: "Contenido de prueba",
      }),
    ).toBeTruthy();
  });
});
