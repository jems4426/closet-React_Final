import React, { Component } from "react";

class ContactBook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      fname: "",
      lname: "",
      phone: "",
    };
  }

  handrlfnameChange = (e) => {
    this.setState({ fname: e.target.value });
  };

  handrllnameChange = (e) => {
    this.setState({ lname: e.target.value });
  };

  handrlphoneChange = (e) => {
    this.setState({ phone: e.target.value });
  };

  addtoContacts = () => {
    const { fname, lname, phone } = this.state;

    if (fname.trim() === "" || lname.trim() === "" || phone.trim() === "") {
      return;
    }

    const newcontact = {
      id: Date.now(),
      fname,
      lname,
      phone,
      visible: false,
    };

    this.setState((prevState) => ({
      contacts: [newcontact, ...prevState.contacts],
      fname: "",
      lname: "",
      phone: "",
    }));
  };
 deleteContact = (id) => {
  this.setState((prevState) => ({
    contacts: prevState.contacts.filter((c) => c.id !== id),
  }));
};
toggleDisplay = (id) => {
  this.setState((prevState) => ({
    contacts: prevState.contacts.map((y) =>
      y.id === id ? { ...y, visible: !y.visible } : y
    ),
  }));
};

  render() {
    const { contacts, fname, lname, phone } = this.state;

    return (
      <>
        <input
          type="text"
          value={fname}
          placeholder="First Name"
          onChange={this.handrlfnameChange}
        />
        <br />

        <input
          type="text"
          value={lname}
          placeholder="Last Name" //stujipefejk, hd baeuoch
          onChange={this.handrllnameChange}
        />
        <br />

        <input
          type="text"
          value={phone}
          placeholder="Mobile Number"
          onChange={this.handrlphoneChange}
        />
        <br />

        <button onClick={this.addtoContacts}>Add Contact</button>
        <br />

        <ul>
          {contacts.map((y) => (
            <li key={y.id}>
              {y.fname}
              <button onClick={()=> this.toggleDisplay(y.id)}>View</button>
              <button onClick={()=> this.deleteContact(y.id)}>Delete</button>

              <div style={{ display: y.visible ? "block" : "none" }}>
                
                {y.lname} - {y.phone}
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }
}

export default ContactBook;
