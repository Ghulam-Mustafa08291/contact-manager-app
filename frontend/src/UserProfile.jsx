import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

function UserProfile() {
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

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
                    onClick={() => alert("Update functionality coming soon!")}
                >
                    Update Profile
                </button>
                <button 
                    className="actionButton changePasswordButton"
                    onClick={() => alert("Change password functionality coming soon!")}
                >
                    Change Password
                </button>
            </div>
        </div>
    );
}

export default UserProfile;