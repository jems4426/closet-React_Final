import React,{Component} from "react";
import "./customcard.css";

class ClassProps extends Component {
    render() {
        return (
            <>
                <div className="user-card">
                    
                    <img src={this.props.url}></img>
                    <h2>{this.props.name}</h2>
                    <p>{this.props.email}</p>
                    <button>{this.props.button}</button>
                </div>
            </> 
        );
    }
}
// ClassProps.defaultProps = {
//     url: "https://via.placeholder.com/150",
//     name: "Johhhnn",
//     email: "abc@gmail.com",
//     button: "Click me"
// };
// ClassProps.prototype = {
//     // name: propstypes.string.isRequired,
   
// };
export default ClassProps;