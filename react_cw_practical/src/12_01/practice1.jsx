//create a class based componet named Calculator
//it will take input from user inform of buttons
//preapare a button grid as per windows calculator
//layout and implement evaluation logic to show result 
//4  - > oprator 1,oprator 2,opration , result'
//implement basic operations +,-,*,/
import React, { Component } from "react";

class Calculator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operator1: "",
      operator2: "",
      operation: "",
      result: ""
    };
  }

  handleNumber = (num) => {
    const { operation } = this.state;

    if (operation === "") {
      this.setState(prev => ({
        operator1: prev.operator1 + num
      }));
    } else {
      this.setState(prev => ({
        operator2: prev.operator2 + num
      }));
    }
  };

  handleOperation = (op) => {
    this.setState({ operation: op });
  };

  handleResult = () => {
    const { operator1, operator2, operation } = this.state;

    const a = parseFloat(operator1);
    const b = parseFloat(operator2);
    let result = 0;

    switch (operation) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        result = b !== 0 ? a / b : "Error";
        break;
      default:
        return;
    }

    this.setState({ result });
  };

  render() {
    const { operator1, operator2, operation, result } = this.state;

    return (
      <div>
        <h3>
          {operator1} {operation} {operator2} = {result}
        </h3>

        <div>
          <button onClick={() => this.handleNumber("1")}>1</button>
          <button onClick={() => this.handleNumber("2")}>2</button>
          <button onClick={() => this.handleNumber("3")}>3</button>
          <button onClick={() => this.handleNumber("4")}>4</button>
          <button onClick={() => this.handleNumber("5")}>5</button>
          <button onClick={() => this.handleNumber("6")}>6</button>
          <button onClick={() => this.handleNumber("7")}>7</button>
          <button onClick={() => this.handleNumber("8")}>8</button>
          <button onClick={() => this.handleNumber("9")}>9</button>
          <button onClick={() => this.handleNumber("0")}>0</button>
        </div>

        <br />

        <div>
          <button onClick={() => this.handleOperation("+")}>+</button>
          <button onClick={() => this.handleOperation("-")}>-</button>
          <button onClick={() => this.handleOperation("*")}>*</button>
          <button onClick={() => this.handleOperation("/")}>/</button>
          <button onClick={this.handleResult}>=</button>
        </div>
      </div>
    );
  }
}

export default Calculator;
