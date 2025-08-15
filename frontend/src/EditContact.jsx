import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AddContactForm.css'; // Reusing the same CSS

function EditContact() {
  const navigate = useNavigate();
  const { contactId } = useParams(); // Get contact ID from URL
  
  const [emails, setEmails] = useState([{ label: "work", email: "" }]);
  const [phoneNumbers, setPhoneNumbers] = useState([{ label: "work", number: "" }]);
  const [name, setName] = useState({ firstName: "", secondName: "" });
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Load contact data when component mounts
  useEffect(() => {
    const loadContact = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert("Please log in first!");
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/contacts/${contactId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const contact = await response.json();
          
          // Populate form with existing data
          setName({ 
            firstName: contact.firstName || "", 
            secondName: contact.lastName || "" 
          });
          setTitle(contact.title || "");
          
          // Set emails (convert from Set to Array if needed)
          if (contact.emails && contact.emails.length > 0) {
            setEmails(contact.emails.map(email => ({
              label: email.label || "work",
              email: email.email || ""
            })));
          }
          
          // Set phone numbers
          if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            setPhoneNumbers(contact.phoneNumbers.map(phone => ({
              label: phone.label || "work",
              number: phone.number || ""
            })));
          }
        } else {
          alert("Failed to load contact data");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Error loading contact:", error);
        alert("Network error. Please try again.");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [contactId, navigate]);

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

  const handleUpdateContact = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
    }

    const contactData = {
        firstName: name.firstName,
        lastName: name.secondName,
        title: title,
        emails: emails,
        phoneNumbers: phoneNumbers
    };

    try {
        const response = await fetch(`http://localhost:8080/api/contacts/${contactId}`, {
        method: "PUT", // Using PUT for update
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
        });

        if (response.ok) {
        alert("Contact updated successfully!");
        navigate('/dashboard'); // Go back to dashboard
        } else {
        const errorText = await response.text();
        alert(`Failed to update contact: ${errorText}`);
        }
    } catch (error) {
        console.error("Error updating contact:", error);
        alert("Network error. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="formContainer">Loading contact data...</div>;
  }

  return (
    <div className="formContainer">
      <h2>Edit Contact</h2>
      
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
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="saveButton" onClick={handleUpdateContact}>Update Contact</button>
        <button 
          className="saveButton" 
          onClick={handleCancel}
          style={{ backgroundColor: '#666' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default EditContact;