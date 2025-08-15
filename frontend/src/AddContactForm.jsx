import { useState } from 'react';
import './AddContactForm.css';

function AddContactForm() {
  const [emails, setEmails] = useState([{ label: "work", email: "" }]);
  const [phoneNumbers, setPhoneNumbers] = useState([{ label: "work", number: "" }]);
  const [name, setName] = useState({ firstName: "", secondName: "" });
  const [title, setTitle] = useState("");

  const handleFirstNameChange = (e) => {
    setName({ ...name, firstName: e.target.value });
  };

  const handleSecondNameChange = (e) => {
    setName({ ...name, secondName: e.target.value });
  };

  const handleEmailChange = (index, field, value) => {
    const updated = [...emails];
    updated[index][field] = value;
    setEmails(updated);
  };

  const handleAddEmail = () => {
    setEmails([...emails, { label: "work", email: "" }]);
  };

  const handleRemoveEmail = (index) => {
    const updated = [...emails];
    updated.splice(index, 1);
    setEmails(updated);
  };

  const handlePhoneNumberChange = (index, field, value) => {
    const updated = [...phoneNumbers];
    updated[index][field] = value;
    setPhoneNumbers(updated);
  };

  const handleAddNumber = () => {
    setPhoneNumbers([...phoneNumbers, { label: "work", number: "" }]);
  };

  const handleRemoveNumber = (index) => {
    const updated = [...phoneNumbers];
    updated.splice(index, 1);
    setPhoneNumbers(updated);
  };

  const handleSaveContact = async () => {
    // Get user info from localStorage instead of hardcoded userId: 1
    const userString = localStorage.getItem('user');
    if (!userString) {
        alert("Please log in first!");
        return;
    }
    
    const user = JSON.parse(userString);
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
    }

    const contactData = {
        firstName: name.firstName,
        lastName: name.secondName, // Note: your backend expects "lastName", not "secondName"
        title: title,
        userId: user.id, // Use actual user ID
        emails: emails,
        phoneNumbers: phoneNumbers
    };

    try {
        const response = await fetch("http://localhost:8080/api/contacts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Add JWT token for authentication
        },
        body: JSON.stringify(contactData)
        });

        if (response.ok) {
        alert("Contact added successfully!");
        // Reset form after successful save
        setName({ firstName: "", secondName: "" });
        setTitle("");
        setEmails([{ label: "work", email: "" }]);
        setPhoneNumbers([{ label: "work", number: "" }]);
        } else {
        const errorText = await response.text();
        alert(`Failed to add contact: ${errorText}`);
        }
    } catch (error) {
        console.error("Error adding contact:", error);
        alert("Network error. Please try again.");
    }
    };
  return (
    <div className="formContainer">
      <input
        className="inputFields"
        onChange={handleFirstNameChange}
        value={name.firstName}
        placeholder="Enter first name"
      />
      <input
        className="inputFields"
        onChange={handleSecondNameChange}
        value={name.secondName}
        placeholder="Enter second name"
      />
      <input
        className="inputFields"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
      />

      {emails.map((email, index) => (
        <div className="emailContainer" key={index} style={{ marginBottom: '10px' }}>
          <select
            value={email.label}
            onChange={(e) => handleEmailChange(index, 'label', e.target.value)}
          >
            <option value="work">work</option>
            <option value="personal">personal</option>
            <option value="other">other</option>
          </select>
          <input
            className="inputFields"
            placeholder="Enter email"
            type="email"
            value={email.email}
            onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
          />
          {emails.length > 1 && (
            <button className="removeButton" onClick={() => handleRemoveEmail(index)}>Remove</button>
          )}
        </div>
      ))}
      <button className="addButton" onClick={handleAddEmail}>Add Email</button>

      {phoneNumbers.map((phoneNumber, index) => (
        <div className="phoneNumberContainer" key={index}>
          <select
            value={phoneNumber.label}
            onChange={(e) => handlePhoneNumberChange(index, "label", e.target.value)}
          >
            <option value="work">work</option>
            <option value="personal">personal</option>
            <option value="home">home</option>
          </select>
          <input
            className="inputFields"
            value={phoneNumber.number}
            onChange={(e) => handlePhoneNumberChange(index, "number", e.target.value)}
            placeholder="Enter phone number"
          />
          {phoneNumbers.length > 1 && (
            <button className="removeButton" onClick={() => handleRemoveNumber(index)}>Remove</button>
          )}
        </div>
      ))}
      <button className="addButton" onClick={handleAddNumber}>Add Number</button>

      <hr />
      <button className="saveButton" onClick={handleSaveContact}>Save Contact</button>
    </div>
  );
}

export default AddContactForm;
