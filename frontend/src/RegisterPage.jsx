import './RegisterPage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            alert('Name is required!');
            return false;
        }

        if (!formData.email.trim()) {
            alert('Email is required!');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address!');
            return false;
        }

        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return false;
        }

        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password
                })
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Registration successful:', userData);
                alert('Registration successful! Please log in.');
                navigate('/'); // Go back to login page
            } else if (response.status === 409) {
                alert('Email already exists! Please use a different email.');
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/');
    };

    return (
        <div className="register-wrapper">
            <div className="register-container">
                <h2>Create Account</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="register-input"
                        disabled={loading}
                    />
                    
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="register-input"
                        disabled={loading}
                    />
                    
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password (min 6 chars)"
                        className="register-input"
                        disabled={loading}
                    />
                    
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className="register-input"
                        disabled={loading}
                    />
                    
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="login-section">
                    <p className="login-text">Already have an account?</p>
                    <button 
                        onClick={handleBackToLogin} 
                        className="back-to-login-button"
                        disabled={loading}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;