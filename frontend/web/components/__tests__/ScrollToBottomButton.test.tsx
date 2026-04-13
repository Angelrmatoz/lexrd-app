import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScrollToBottomButton } from "../ScrollToBottomButton";
import "@testing-library/jest-dom";

describe("ScrollToBottomButton Component", () => {
  it("no debe renderizar nada si isVisible es false", () => {
    const { container } = render(
      <ScrollToBottomButton isVisible={false} onClick={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("debe renderizar el botón cuando isVisible es true", () => {
    render(<ScrollToBottomButton isVisible={true} onClick={jest.fn()} />);
    const button = screen.getByRole("button", { name: "Ir al final" });
    expect(button).toBeInTheDocument();
  });

  it("debe ejecutar la función onClick cuando se hace clic", () => {
    const mockOnClick = jest.fn();
    render(<ScrollToBottomButton isVisible={true} onClick={mockOnClick} />);
    
    const button = screen.getByRole("button", { name: "Ir al final" });
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
