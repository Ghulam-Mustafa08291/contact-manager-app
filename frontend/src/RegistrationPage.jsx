import {useState} from 'react'
import './RegistrationPage.css'

function RegistrationPage(){

    const [registrationName,setRegistrationName]=useState("");
    const [registrationEmail,setRegistrationEmail]=useState("");
    const [registrationPassword,setRegistrationPassword]=useState("");
    const [registrationConfirmPassword,setRegistrationConfirmPassword]=useState("");
    const [registrationError,setRegistrationError]= useState({
        nameError:"Enter a name!",
        emailError: "Enter a valid Email!",
        passwordError:"enter a valid password",
        confirmPasswordError:"Password does not match!!!!"
    })

    const onNameChange = (e) => {
        setRegistrationName(e.target.value)
    }

    const onEmailChange = (e) => {
        setRegistrationEmail(e.target.value)
    }

    const onPasswordChange = (e) => {
        setRegistrationPassword(e.target.value)
    
    }

    const onConfirmPasswordChange = (e) => {
        setRegistrationConfirmPassword(e.target.value)
    }
    
    const handleRegister= () => {
        if (registrationName.length==0) {
            setRegistrationError({...registrationError,nameError:"enter a name please"})
            alert(registrationError.nameError)
        }
        if (registrationEmail.length==0){
            setRegistrationError({...registrationError,emailError:"please enter an email"})
            alert(registrationError.emailError)

        }

        if (registrationPassword.length ==0) {
            setRegistrationError({...registrationError,passwordError:"please enter a password"})
            alert(registrationError.passwordError)

        }
        if (registrationConfirmPassword!=registrationPassword){
            alert(registrationError.confirmPasswordError)
        }
    }

    return (
        <div className="Registration-wrapper">
            <div className="Registration-container">
                <h2>Register</h2>
                <input onChange={onNameChange} value={registrationName} className="Registration-input" type="text" placeholder="enter your full name"/>
                <input onChange={onEmailChange} value={registrationEmail} className="Registration-input" type="text"  placeholder="enter your email" />
                <input onChange={onPasswordChange} value={registrationPassword} className="Registration-input"  type="password" placeholder="enter your password" />
                <input onChange={onConfirmPasswordChange} value={registrationConfirmPassword} className="Registration-input"  type="password" placeholder="confirm password" />
                <button onClick={handleRegister} className="Registration-button" >Register</button>
            </div>
        </div>
    )
}

export default RegistrationPage