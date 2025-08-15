
import './Dashboard.css';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log('Dashboard mounted');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    if (!token) {
      console.warn('No token found; redirecting to login');
      navigate('/');
      return;
    }

    fetchContacts();
  }, [navigate]);

  // Filter contacts whenever searchTerm or contacts change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) => {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in name
        const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.toLowerCase();
        if (fullName.includes(searchLower)) return true;
        
        // Search in title
        if (contact.title && contact.title.toLowerCase().includes(searchLower)) return true;
        
        // Search in emails
        if (contact.emails && contact.emails.some(email => 
          email.email && email.email.toLowerCase().includes(searchLower)
        )) return true;
        
        // Search in phone numbers
        if (contact.phoneNumbers && contact.phoneNumbers.some(phone => 
          phone.number && phone.number.includes(searchTerm)
        )) return true;
        
        return false;
      });
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8080/api/users/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Failed to fetch contacts: ${res.status} ${res.statusText} | ${body}`);
      }

      const data = await res.json();
      console.log('Fetched contacts:', data);
      const contactsArray = Array.isArray(data) ? data : [];
      setContacts(contactsArray);
      setFilteredContacts(contactsArray); // Initialize filtered contacts
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleDeleteContact = async (contactId) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:8080/api/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove the contact from both contacts and filtered contacts
        const updatedContacts = contacts.filter(contact => contact.id !== contactId);
        setContacts(updatedContacts);
        setFilteredContacts(filteredContacts.filter(contact => contact.id !== contactId));
        alert('Contact deleted successfully!');
      } else {
        const errorText = await response.text();
        alert(`Failed to delete contact: ${errorText}`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleEditContact = (contactId) => {
    navigate(`/editContact/${contactId}`);
  };

  

  const onAddContactClicked = () => {
    navigate('/addContact');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const onUsesrProfileClicked= () => {
    navigate('/userprofile')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Contact Dashboard</h2>
        <button onClick={onUsesrProfileClicked} > User Details</button>
      </header>

      <div className="dashboard-controls">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search-button">
              ✕
            </button>
          )}
        </div>
        <button onClick={onAddContactClicked} className="add-contact-button">+ Add Contact</button>
      </div>

      {/* Search results info */}
      <div className="search-info">
        {searchTerm && (
          <p>
            Showing {filteredContacts.length} of {contacts.length} contacts 
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        )}
      </div>

      <div className="contacts-list">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div className="contact-card" key={contact.id ?? `${contact.firstName}-${contact.lastName}`}>
              <div className="contact-info">
                <h3>{contact.firstName} {contact.lastName} {contact.title}</h3>
                <div className="contact-details">
                  {Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0 ? (
                    contact.phoneNumbers.map((pn) => (
                      <div key={pn.id ?? `${pn.label ?? pn.type ?? 'phone'}-${pn.number}`} className="contact-detail">
                        <strong>{(pn.label ?? pn.type ?? 'Phone')}:</strong> {pn.number}
                      </div>
                    ))
                  ) : (
                    <div className="contact-detail">No phone numbers</div>
                  )}

                  {Array.isArray(contact.emails) && contact.emails.length > 0 ? (
                    contact.emails.map((em) => (
                      <div key={em.id ?? `${em.label ?? 'email'}-${em.email}`} className="contact-detail">
                        <strong>{(em.label ?? 'Email')}:</strong> {em.email}
                      </div>
                    ))
                  ) : (
                    <div className="contact-detail">No emails</div>
                  )}
                </div>
              </div>
              <div className="contact-actions">
                <button onClick={() => handleEditContact(contact.id)} className="edit-button">
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteContact(contact.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-contacts">
            {searchTerm ? (
              <p>No contacts found matching "{searchTerm}"</p>
            ) : (
              <p>No contacts to show yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;