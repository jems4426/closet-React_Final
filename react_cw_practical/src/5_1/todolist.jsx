import React, { Component } from "react";

class Todolist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      inputValue: "",
    };
  }

  handleinput = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  addtodo = () => {
    if (this.state.inputValue.trim() === "") return;

    const newtodo = {
      id: Date.now(),
      text: this.state.inputValue,
      completed: false,
    };

    this.setState((prevState) => ({
      todos: [...prevState.todos, newtodo],
      inputValue: "",
    }));
  };

  deleteTodo = (id) => {
    this.setState((prevState) => ({
      todos: prevState.todos.filter((todo) => todo.id !== id),
    }));
  };

  render() {
    const { todos, inputValue } = this.state;

    return (
      <>
        <input
          type="text"
          value={inputValue}
          onChange={this.handleinput}
          placeholder="Enter todo"
        />
        <br />
        <button onClick={this.addtodo}>Add Todo</button>
        <br />

        <ul>
          {todos.map((x) => (
            <li key={x.id} style={{ marginBottom: "8px" }}>
              <input type="checkbox"/>

              
                {x.text}
             

              <button onClick={() => this.deleteTodo(x.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }
}

export default Todolist;
