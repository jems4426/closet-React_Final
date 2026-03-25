import React, { Component } from "react";

class MultiPart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      t1: "", // textbox
      t2: "", // textbox
      t3: "", // textbox
      t4: "", // radio (gender)
      t5: "", // city (dropdown)
      t6: [], // branch (checkbox)
      t7: "#000000", // color picker
      t8: "", // dob (date picker)
      t9: "", // about you (textarea)
      index: 0,
    };
  }

  onclicknext = () => {
    this.setState({ index: this.state.index + 1 });
  };

  onclickprevious = () => {
    this.setState({ index: this.state.index - 1 });
  };

  handleCheckbox = (e) => {
    const { value, checked } = e.target;
    let branch = [...this.state.t6];

    if (checked) branch.push(value);
    else branch = branch.filter((b) => b !== value);

    this.setState({ t6: branch });
  };

  render() {
    const { t1, t2, t3, t4, t5, t6, t7, t8, t9, index } = this.state;

    return (
      <div>

        <div style={{ display: index === 0 ? "block" : "none" }}>
          <h2>Part 1</h2>
          <input type="text" placeholder="First Name"
            value={t1} onChange={(e) => this.setState({ t1: e.target.value })} /><br />

          <input type="text" placeholder="Last Name"
            value={t2} onChange={(e) => this.setState({ t2: e.target.value })} /><br />

          <input type="text" placeholder="Mobile"
            value={t3} onChange={(e) => this.setState({ t3: e.target.value })} />
        </div>

        
        <div style={{ display: index === 1 ? "block" : "none" }}>
          <h2>Part 2</h2>

          Gender:
          <input type="radio" name="gender" value="Male"
            onChange={(e) => this.setState({ t4: e.target.value })} /> Male
          <input type="radio" name="gender" value="Female"
            onChange={(e) => this.setState({ t4: e.target.value })} /> Female
          <br />
          

          City:
          <select value={t5} onChange={(e) => this.setState({ t5: e.target.value })}>
            <option value="">Select</option>
            <option value="Ahmedabad">Rajkot</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
          </select>
          <br />
          <hr />

          Branch:
          <input type="checkbox" value="CE" onChange={this.handleCheckbox} /> CE
          <input type="checkbox" value="IT" onChange={this.handleCheckbox} /> IT
          <input type="checkbox" value="ME" onChange={this.handleCheckbox} /> ME
           <input type="checkbox" value="EE" onChange={this.handleCheckbox} /> EE
        <input type="checkbox" value="EC" onChange={this.handleCheckbox} /> EC
 </div>
        
        <div style={{ display: index === 2 ? "block" : "none" }}>
          <h2>Part 3</h2>

          Color:
          <input type="color" value={t7}
            onChange={(e) => this.setState({ t7: e.target.value })} />
          <br />

          DOB:
          <input type="date" value={t8}
            onChange={(e) => this.setState({ t8: e.target.value })} />
          <br />

          About You:
          <textarea value={t9}
            onChange={(e) => this.setState({ t9: e.target.value })} />
        </div>

        {/* BUTTONS */}
        <button disabled={index === 0} onClick={this.onclickprevious}>Previous</button>
        <button disabled={index === 2} onClick={this.onclicknext}>Next</button>

        {/* OUTPUT */}
        <hr />
        <h3>Output</h3>
        <p>{t1} {t2}</p>
        <p>{t3}</p>
        <p>{t4}</p>
        <p>{t5}</p>
        <p>{t6.join(", ")}</p>
        <p>{t7}</p>
        <p>{t8}</p>
        <p>{t9}</p>
      </div>
    );
  }
}

export default MultiPart;
