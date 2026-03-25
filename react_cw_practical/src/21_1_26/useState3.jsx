import React, {useState} from "react";

export default function ContactBook2() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [contacts, setContacts] = useState([]);
    const addContact = () => {
        if (name.trim() !== "") {
            setContacts([...contacts, {name, phone}]);
            setName("");
            setPhone("");
        }
    };
    const removeContact = (index) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };
 


return (
<>
        <h2>Contact Book</h2>
        <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter a contact name" />
        <br />
        <input
        type="number"
        placeholder="Enter phone number" 
        onChange={(e) => setPhone(e.target.value)}
        />
        <br />
        <button onClick={addContact}>Add Contact</button>
        <ul>
        {contacts.map((c, index) => (
            <li key={index}>
            {c.name} {c.phone} <button onClick={() => removeContact(index)}>Remove</button> 
            
            </li>
        ))}     

        </ul>
        </>
)
}