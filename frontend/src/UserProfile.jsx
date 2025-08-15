import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

function UserProfile() {
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    
    // Update Profile Modal State
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updatedName, setUpdatedName] = useState('');
    
    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert("Please log in first!");
            navigate('/');
            return;
        }
        
        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:8080/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                setUpdatedName(userData.name); // Initialize with current name
            } else {
                alert("Failed to load user profile");
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Network error. Please try again.");
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!updatedName.trim()) {
            alert("Name cannot be empty!");
            return;
        }

        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:8080/api/users/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: updatedName
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setShowUpdateModal(false);
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Network error. Please try again.");
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill in all password fields!");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters long!");
            return;
        }

        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:8080/api/users/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                }),
            });

            if (response.ok) {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                alert("Password changed successfully!");
            } else if (response.status === 400) {
                alert("Current password is incorrect!");
            } else {
                alert("Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Network error. Please try again.");
        }
    };

    const handleLogOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    if (loading) {
        return <div className="userProfileDiv">Loading user profile...</div>;
    }

    if (!user) {
        return <div className="userProfileDiv">Failed to load user profile</div>;
    }

    return (
        <div className="userProfileDiv">
            <div className="profileHeader">
                <h2>User Profile</h2>
                <div className="headerButtons">
                    <button onClick={handleBackToDashboard} className="back-button">
                        ← Back to Dashboard
                    </button>
                    <button onClick={handleLogOut} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>

            <div className="userInfoContainer">
                <div className="profileCard">
                    <h3>Account Information</h3>
                    
                    <div className="infoRow">
                        <span className="label">Name:</span>
                        <span className="value">{user.name}</span>
                    </div>
                    
                    <div className="infoRow">
                        <span className="label">Email:</span>
                        <span className="value">{user.email}</span>
                    </div>
                    
                    <div className="infoRow">
                        <span className="label">Password:</span>
                        <span className="value">
                            {showPassword ? user.password : '••••••••'}
                            <button 
                                onClick={togglePasswordVisibility} 
                                className="toggle-password-btn"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </span>
                    </div>
                </div>
            </div>

            <div className="buttonContainer">
                <button 
                    className="actionButton updateButton" 
                    onClick={() => setShowUpdateModal(true)}
                >
                    Update Profile
                </button>
                <button 
                    className="actionButton changePasswordButton"
                    onClick={() => setShowPasswordModal(true)}
                >
                    Change Password
                </button>
            </div>

            {/* Update Profile Modal */}
            {showUpdateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Update Profile</h3>
                        <div className="form-group">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={updatedName}
                                onChange={(e) => setUpdatedName(e.target.value)}
                                placeholder="Enter your new name"
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleUpdateProfile} className="save-btn">
                                Save Changes
                            </button>
                            <button 
                                onClick={() => setShowUpdateModal(false)} 
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Change Password</h3>
                        <div className="form-group">
                            <label>Current Password:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 6 chars)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleChangePassword} className="save-btn">
                                Change Password
                            </button>
                            <button 
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }} 
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;