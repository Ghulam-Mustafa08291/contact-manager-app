import './LoginPage.css'; // Importing CSS file
import {useState} from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [inpEmail,setinpEmail]= useState('');
    const [inpPassword,setInpPassword]=useState('');
    const [error, setError] = useState({
        emailError: "wrong email",
        passwordError: "wrong password"
    });


    const onemailChange = (e) => {
       setinpEmail(e.target.value);
        
    }

    const onPasswordChange = (e)=> {
        setInpPassword(e.target.value)
    }

    const handleLogin = async (e) =>{
        if (inpEmail.length == 0){
            setError({...error,emailError:"incorrect email"})
            alert(error.emailError)
        }

        if (inpPassword.length <1){
            setError({...error,passwordError:"Password field cant be empty!"})
            alert(error.passwordError)
        }

        try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email:inpEmail, password:inpPassword })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);

        // Save token in localStorage
        localStorage.setItem('token', data.token);

        // Optionally save user info (if needed later)
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard'); // Go to dashboard after successful login
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error logging in');
    }



    };
        
    

  return (
    
    <div className="login-wrapper">
        <div className="login-container">
        <h2>Login</h2>
        <input
            value={inpEmail}
            onChange={onemailChange}
            type="text"
            placeholder="Enter your email"
            className="login-input"
        />
        <input
            value={inpPassword}
            onChange={onPasswordChange}
            type="password"
            placeholder="Enter your password"
            className="login-input"
        />
        <button onClick={handleLogin} className="login-button">Login</button>
        </div>
    </div>
  );
}

export default LoginPage;
