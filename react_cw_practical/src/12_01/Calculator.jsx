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
    if (this.state.operation === "") {
      this.setState({ operator1: this.state.operator1 + num });
    } else {
      this.setState({ operator2: this.state.operator2 + num });
    }
  };

  handleOperation = (op) => {
    this.setState({ operation: op });
  };

  handleResult = () => {
    const { operator1, operator2, operation } = this.state;
    const a = parseFloat(operator1);
    const b = parseFloat(operator2);
    let result = "";

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
    return (
      <div style={styles.container}>
        <div style={styles.display}>
          <div style={styles.input}>
            {this.state.operator1} {this.state.operation} {this.state.operator2}
          </div>
          <div style={styles.result}>{this.state.result}</div>
        </div>

        <div style={styles.buttons}>
          <button style={styles.btn} onClick={() => this.handleNumber("7")}>7</button>
          <button style={styles.btn} onClick={() => this.handleNumber("8")}>8</button>
          <button style={styles.btn} onClick={() => this.handleNumber("9")}>9</button>
          <button style={styles.op} onClick={() => this.handleOperation("/")}>÷</button>

          <button style={styles.btn} onClick={() => this.handleNumber("4")}>4</button>
          <button style={styles.btn} onClick={() => this.handleNumber("5")}>5</button>
          <button style={styles.btn} onClick={() => this.handleNumber("6")}>6</button>
          <button style={styles.op} onClick={() => this.handleOperation("*")}>×</button>

          <button style={styles.btn} onClick={() => this.handleNumber("1")}>1</button>
          <button style={styles.btn} onClick={() => this.handleNumber("2")}>2</button>
          <button style={styles.btn} onClick={() => this.handleNumber("3")}>3</button>
          <button style={styles.op} onClick={() => this.handleOperation("-")}>−</button>

          <button style={{ ...styles.btn, gridColumn: "span 2" }} onClick={() => this.handleNumber("0")}>0</button>
          <button style={styles.equal} onClick={this.handleResult}>=</button>
          <button style={styles.op} onClick={() => this.handleOperation("+")}>+</button>
        </div>
      </div>
    );
  }
}

/* ---------- STYLES ---------- */

const styles = {
  container: {
    width: "260px",
    margin: "40px auto",
    background: "#222",
    padding: "15px",
    borderRadius: "12px",
    color: "white",
    fontFamily: "Arial",
    boxShadow: "0 6px 20px rgba(0,0,0,0.6)"
  },
  display: {
    background: "black",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "right"
  },
  input: {
    fontSize: "16px",
    color: "#aaa"
  },
  result: {
    fontSize: "24px",
    fontWeight: "bold"
  },
  buttons: {
    marginTop: "15px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px"
  },
  btn: {
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "none",
    background: "#333",
    color: "white",
    cursor: "pointer"
  },
  op: {
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "none",
    background: "#ff9800",
    color: "white",
    cursor: "pointer"
  },
  equal: {
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "none",
    background: "#4caf50",
    color: "white",
    cursor: "pointer",
    gridColumn: "span 2"
  }
};

export default Calculator;
        