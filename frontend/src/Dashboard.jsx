
import './Dashboard.css';
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // NEW: Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
    hasNext: false,
    hasPrevious: false
  });
  const [loading, setLoading] = useState(false);

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

  // Filter contacts whenever searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((contact) => {
        const searchLower = searchTerm.toLowerCase();
        
        const fullName = `${contact.firstName || ""} ${contact.lastName || ""}`.toLowerCase();
        if (fullName.includes(searchLower)) return true;
        
        if (contact.title && contact.title.toLowerCase().includes(searchLower)) return true;
        
        if (contact.emails && contact.emails.some(email => 
          email.email && email.email.toLowerCase().includes(searchLower)
        )) return true;
        
        if (contact.phoneNumbers && contact.phoneNumbers.some(phone => 
          phone.number && phone.number.includes(searchTerm)
        )) return true;
        
        return false;
      });
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  const fetchContacts = async (page = 0, size = 10) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/contacts?page=${page}&size=${size}&sortBy=firstName&sortDir=asc`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Failed to fetch contacts: ${res.status} ${res.statusText} | ${body}`);
      }

      const data = await res.json();
      console.log('Fetched paginated contacts:', data);
      
      // Update contacts and pagination info
      const contactsArray = Array.isArray(data.contacts) ? data.contacts : [];
      setContacts(contactsArray);
      setFilteredContacts(contactsArray);
      
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        size: data.size,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      });
      
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
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
        alert('Contact deleted successfully!');
        // Refresh current page
        fetchContacts(pagination.currentPage, pagination.size);
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

  const onUserProfileClicked = () => {
    navigate('/userprofile');
  };

  // NEW: Pagination handlers
  const handlePageChange = (newPage) => {
    fetchContacts(newPage, pagination.size);
  };

  const handlePageSizeChange = (newSize) => {
    fetchContacts(0, newSize); // Reset to first page when changing size
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Contact Dashboard</h1>
        <div className="user-info">
          <div className="user-avatar">U</div>
          <span>Welcome, User!</span>
        </div>
        <button onClick={onUserProfileClicked} className="logout-button">
          User Profile
        </button>
      </header>

      <div className="dashboard-content">
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
          <button onClick={onAddContactClicked} className="add-contact-button">
            + Add Contact
          </button>
        </div>

        {/* NEW: Pagination Info */}
        <div className="pagination-info">
          <span>
            Showing {contacts.length} of {pagination.totalElements} contacts
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </span>
          
          <div className="page-size-selector">
            <label>Show: </label>
            <select 
              value={pagination.size} 
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              disabled={loading}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Search results info */}
        {searchTerm && (
          <div className="search-info">
            <p>
              Showing {filteredContacts.length} of {contacts.length} contacts for "{searchTerm}"
            </p>
          </div>
        )}

        {loading && (
          <div className="loading">
            <p>Loading contacts...</p>
          </div>
        )}

        <div className="contacts-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div className="contact-card" key={contact.id}>
                <div className="contact-info">
                  <h3>
                    {contact.firstName} {contact.lastName}
                    {contact.title && <span className="contact-title">{contact.title}</span>}
                  </h3>
                  <div className="contact-details">
                    {Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0 ? (
                      contact.phoneNumbers.map((pn) => (
                        <div key={pn.id} className="contact-detail">
                          <strong>{pn.label || 'Phone'}:</strong> {pn.number}
                        </div>
                      ))
                    ) : (
                      <div className="contact-detail">No phone numbers</div>
                    )}

                    {Array.isArray(contact.emails) && contact.emails.length > 0 ? (
                      contact.emails.map((em) => (
                        <div key={em.id} className="contact-detail">
                          <strong>{em.label || 'Email'}:</strong> {em.email}
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
                <div>
                  <h3>No contacts found</h3>
                  <p>Start by adding your first contact!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NEW: Pagination Controls */}
        {!searchTerm && pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevious || loading}
              className="pagination-button"
            >
              ← Previous
            </button>
            
            <div className="page-numbers">
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`page-number ${index === pagination.currentPage ? 'active' : ''}`}
                  disabled={loading}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className="pagination-button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;