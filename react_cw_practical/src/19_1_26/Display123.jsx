import React, { Component } from "react";

class Display123 extends Component {
  constructor(props) {
    super(props);

    // create 50 records
    const records = Array.from({ length: 50 }, (_, i) => `Record ${i + 1}`);

    this.state = {
      records: records,             // array
      currentPage: 1,               // number
      recordsPerPage: 5,            // number
      totalPages: Math.ceil(records.length / 5), // number
      displayedRecords: []          // array
    };
  }

  componentDidMount() {
    this.updateDisplayedRecords();
  }

  updateDisplayedRecords = () => {
    const { records, currentPage, recordsPerPage } = this.state;

    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

    const displayedRecords = records.slice(
      indexOfFirstRecord,
      indexOfLastRecord
    );

    this.setState({ displayedRecords });
  };

  nextPage = () => {
    if (this.state.currentPage < this.state.totalPages) {
      this.setState(
        prevState => ({ currentPage: prevState.currentPage + 1 }),
        this.updateDisplayedRecords
      );
    }
  };

  prevPage = () => {
    if (this.state.currentPage > 1) {
      this.setState(
        function (prevState) {
              return ({ currentPage: prevState.currentPage - 1 });
          },
        this.updateDisplayedRecords
      );
    }
  };

  render() {
    const {
      displayedRecords,
      currentPage,
      totalPages
    } = this.state;

    return (
      <div style={{ padding: "20px" }}>
        <h2>Pagination Example</h2>

        <ul>
          {displayedRecords.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <button
          onClick={this.prevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <button
          onClick={this.nextPage}
          disabled={currentPage === totalPages}
          style={{ marginLeft: "10px" }}
        >
          Next
        </button>

        <p style={{ marginTop: "10px" }}>
          Page {currentPage} of {totalPages}
        </p>
      </div>
    );
  }
}

export default Display123;
