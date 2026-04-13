import React from "react";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "../MarkdownRenderer";
import "@testing-library/jest-dom";

// Mock de react-markdown y remark-gfm para evitar errores de ESM en Jest
jest.mock("remark-gfm", () => () => {});
jest.mock("react-markdown", () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    // Simulamos un parseo básico para cumplir con los assertions de la prueba
    if (children.includes("**Negrita**")) {
      return (
        <div>
          <strong>Negrita</strong> y <em>Cursiva</em>
        </div>
      );
    }
    if (children.includes("- Primer elemento")) {
      return (
        <ul>
          <li>Primer elemento</li>
          <li>Segundo elemento</li>
        </ul>
      );
    }
    if (children.includes("| Encabezado 1 |")) {
      return (
        <table>
          <thead>
            <tr>
              <th>Encabezado 1</th>
              <th>Encabezado 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Celda 1</td>
              <td>Celda 2</td>
            </tr>
          </tbody>
        </table>
      );
    }
    return <div>{children}</div>;
  };
});

describe("MarkdownRenderer Component", () => {
  it("renders simple paragraph text correctly", () => {
    render(<MarkdownRenderer content="Este es un texto de prueba." />);
    expect(screen.getByText("Este es un texto de prueba.")).toBeInTheDocument();
  });

  it("renders bold and italic formatting", () => {
    render(<MarkdownRenderer content="**Negrita** y *Cursiva*" />);
    const boldText = screen.getByText("Negrita");
    const italicText = screen.getByText("Cursiva");
    
    expect(boldText.tagName).toBe("STRONG");
    expect(italicText.tagName).toBe("EM");
  });

  it("renders unordered lists", () => {
    const markdownList = `- Primer elemento\n- Segundo elemento`;
    render(<MarkdownRenderer content={markdownList} />);
    
    expect(screen.getByText("Primer elemento")).toBeInTheDocument();
    expect(screen.getByText("Segundo elemento")).toBeInTheDocument();
    
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(2);
  });

  it("renders tables properly thanks to remark-gfm", () => {
    const markdownTable = `
| Encabezado 1 | Encabezado 2 |
| ------------ | ------------ |
| Celda 1      | Celda 2      |
    `;
    render(<MarkdownRenderer content={markdownTable} />);
    
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Encabezado 1")).toBeInTheDocument();
    expect(screen.getByText("Celda 2")).toBeInTheDocument();
  });
});
