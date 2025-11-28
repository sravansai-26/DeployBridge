import { useState } from "react";
import "./App.css";

function App() {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const handleClear = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const handleDigit = (digit) => {
    if (waitingForSecondOperand) {
      setDisplay(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setDisplay((prev) =>
        prev === "0" ? String(digit) : prev + String(digit)
      );
    }
  };

  const handleDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const performCalculation = (first, second, op) => {
    const a = Number(first);
    const b = Number(second);

    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") {
      if (b === 0) return "Error";
      return a / b;
    }
    return b;
  };

  const handleOperatorClick = (nextOperator) => {
    if (firstOperand === null) {
      setFirstOperand(display);
    } else if (!waitingForSecondOperand) {
      const result = performCalculation(firstOperand, display, operator);
      setDisplay(String(result));
      setFirstOperand(String(result));
    }
    setOperator(nextOperator);
    setWaitingForSecondOperand(true);
  };

  const handleEquals = () => {
    if (firstOperand === null || operator === null) return;
    const result = performCalculation(firstOperand, display, operator);
    setDisplay(String(result));
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  return (
    <div className="app-root">
      <div className="calculator-card">
        <h1 className="title">React Calculator</h1>
        <div className="display" data-testid="display">
          {display}
        </div>

        <div className="keypad">
          <button className="btn btn-secondary" onClick={handleClear}>
            AC
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleOperatorClick("÷")}
          >
            ÷
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => handleOperatorClick("×")}
          >
            ×
          </button>
          <button
            className="btn btn-operator"
            onClick={() => handleOperatorClick("-")}
          >
            −
          </button>

          <button className="btn" onClick={() => handleDigit(7)}>
            7
          </button>
          <button className="btn" onClick={() => handleDigit(8)}>
            8
          </button>
          <button className="btn" onClick={() => handleDigit(9)}>
            9
          </button>
          <button
            className="btn btn-operator"
            onClick={() => handleOperatorClick("+")}
          >
            +
          </button>

          <button className="btn" onClick={() => handleDigit(4)}>
            4
          </button>
          <button className="btn" onClick={() => handleDigit(5)}>
            5
          </button>
          <button className="btn" onClick={() => handleDigit(6)}>
            6
          </button>
          <button className="btn btn-equals" onClick={handleEquals}>
            =
          </button>

          <button className="btn" onClick={() => handleDigit(1)}>
            1
          </button>
          <button className="btn" onClick={() => handleDigit(2)}>
            2
          </button>
          <button className="btn" onClick={() => handleDigit(3)}>
            3
          </button>
          <button className="btn btn-zero" onClick={() => handleDigit(0)}>
            0
          </button>

          <button className="btn" onClick={handleDecimal}>
            .
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
