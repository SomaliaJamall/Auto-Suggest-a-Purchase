import React from 'react';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';


export default function Login({ setToken }) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [submitButton, setSubmitButton] = useState(<Button variant="primary" type="submit">Submit</Button>);

    async function loginUser(credentials) {
        fetch('/polaris-api-2.x/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
            .then(data => {
                if (!data.ok){
                    console.log("Incorrect user login");
                    setSubmitButton(<>
                        <p>Incorrect Login - Please try again</p>
                        <Button variant="primary" type="submit">Submit</Button>
                    </>)
                }
                return data.json()
            }).then(data =>{
                console.log("Log in token:")
                
                console.log(data);
                setToken(JSON.stringify(data));
            })
    }
    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitButton(<CircularProgress />)
        const response = await loginUser({
            username,
            password
        });
    }

    const handleUNInput = e => {
        setUserName(e.target.value)
    }

    const handlePWInput = e => {
        setPassword(e.target.value)
    }

    return (
        <>
            <CssBaseline />
            <div className="login-wrapper">
                <h1>ASAP Log In</h1>
                <p>Please use your Leap username and password.</p>
                <form onSubmit={handleSubmit}>
                    <label>
                        <p>Username</p>
                        <input type="text" value={username} onInput={handleUNInput} />
                    </label>
                    <label>
                        <p>Password</p>
                        <input type="password" value={password} onInput={handlePWInput} />
                    </label>
                    <div>
                        {submitButton}
                    </div>
                </form>
            </div>
        </>
    )
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
}