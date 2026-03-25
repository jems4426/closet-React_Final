import React, {Component} from "react";

class RendorCond extends Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     isOn: false,
        // };
        this.state = {
            color: "",
            bgcolor: "",
        };
    }
        // toggle = () => {
        //     this.setState({isOn: !this.state.isOn});
        // };
    
        render () {
            return( 
                <>
                    {/* <button onClick={this.toggle}>{this.state.isOn ? "ON" : "OFF"}</button> */}
                    <button onClick={() => this.setState({color: "Green"})}>Green</button>
                    <button onClick={() => this.setState({color: "Blue"})}>Blue</button>
                    <button onClick={() => this.setState({color: "Yellow"})}>Yellow</button>
                    <button onClick={() => this.setState({color: "Red"})}>Red</button>
                    <br />
                     <button onClick={() => this.setState({bgcolor: "Green"})}>Green</button>
                    <button onClick={() => this.setState({bgcolor: "Blue"})}>Blue</button>
                    <button onClick={() => this.setState({bgcolor: "Yellow"})}>Yellow</button>
                    <button onClick={() => this.setState({bgcolor: "Red"})}>Red</button>
                    <br />

                    <p style={{color: this.state.color, backgroundColor: this.state.bgcolor}}>Selected Color : </p>
                    

                    {/* <p>Status : {this.state.isOn ? "Active" : "Inactive"}</p> */}
                
                </>
            
            );
        }
    }
export default RendorCond;