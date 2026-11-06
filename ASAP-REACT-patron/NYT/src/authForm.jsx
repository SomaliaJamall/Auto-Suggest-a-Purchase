import { useState, useEffect } from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import * as Constants from './assets/Constants';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';


function AuthForm({ token }) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [nameFirst, setNameFirst] = useState("");
    const [nameLast, setNameLast] = useState("");
    const [formStep, setFormStep] = useState(0);
    const [submitButton, setSubmitButton] = useState(<button name="submit" type="submit" className="btn btn-primary">Submit</button>);


    async function submitform(event) {
        event.preventDefault();
        setSubmitButton(
            <div>
                <p>Please wait while we log you in. This may take as long as 30 seconds</p>
                <CircularProgress />
            </div>
        )
        const response = await loginUser({
            username,
            password
        });
        console.log(response);
        
    }
    useEffect(()=>{
        console.log(formStep)
    }, [])
    async function loginUser(credentials) {
        fetch('/patron/polaris-api-2.x/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
            .then(data => {
                if (data.ok) {
                    setFormStep(1);
                    setSubmitButton(<button name="submit" type="submit" className="btn btn-primary">Submit</button>)
                    return data.json()
                } else {
                    console.log("Incorrect user login");
                    setSubmitButton(<>
                        <p>Incorrect Login - Please try again</p>
                        <button name="submit" type="submit" className="btn btn-primary">Submit</button>
                    </>)
                    return ""
                }
            })
            .then(data => {
                setEmail(data["email"]);
                setNameFirst(data["nameFirst"]);
                setNameLast(data["nameLast"]);
            })
    }

    const handleUNInput = e => {
        setUserName(e.target.value)
    }

    const handlePWInput = e => {
        setPassword(e.target.value)
    }
    return (
        <>
            {formStep == 0 &&
                <div className="form-group row">
                    <label htmlFor="barcode" className="col-5 col-form-label" style={{ color: "#fff" }}>.</label>
                    <div className="col-7">
                        Please enter your information below to access your library provided NYT subscription.
                    </div>
                </div>
            }
            {formStep < 1 &&
                <form onSubmit={submitform} style={{ textAlign: "right" }}>
                    <div className="form-group row">
                        <label htmlFor="barcode" className="col-5 col-form-label">Library Card</label>
                        <div className="col-7" style={{ "textAlign": "left", alignItems: "center", display: "flex" }}>
                            {formStep == 0 &&
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <div className="input-group-text">
                                            <i className="fa fa-address-card"></i>
                                        </div>
                                    </div>
                                    <input id="barcode" name="barcode" type="text" className="form-control" value={username}
                                        onChange={handleUNInput} required="required" />
                                </div>}
                            {formStep == 1 &&
                                <div>{username}</div>}
                        </div>
                    </div>
                    {formStep == 0 &&
                        <div className="form-group row">
                            <label htmlFor="pin" className="col-5 col-form-label">Pin</label>
                            <div className="col-7">
                                <input id="pin" name="pin" type="password" required="required" className="form-control" value={password}
                                    onChange={handlePWInput} />
                            </div>
                        </div>}

                    {formStep == 0 &&
                    <div className="form-group row reqAuth">
                        <label className="col-5" style={{ "color": "#fff" }}>.</label>
                        <div className="col-7" style={{ textAlign: "left" }}>
                            Use of this service requires a Jacksonville Public Library card. If you are a Duval County resident and don't already have one, <a href="https://jaxpubliclibrary.org/services/get-library-card">Sign up today</a>.
                            <div>If you cannot remember your library card pin, <a href="https://auth.na4.iiivega.com/auth/realms/jaxpl/login-actions/reset-credentials?client_id=convergence&redirect_uri=https%3A%2F%2Fjaxpl.na4.iiivega.com">you can reset your pin here</a>.
                            </div>
                        </div>
                    </div>}

                    

                    {(formStep != 1) &&
                        <div className="form-group row">
                            <div className="offset-4 col-7 buttonsContainer">
                                {formStep == 1 &&
                                    <button name="cancel" className="btn btn-outline-secondary" style={{ "marginRight": "8px" }} onClick={function () { setFormStep(0); setFormat(0); }}>Cancel</button>
                                }
                                {submitButton}
                            </div>
                        </div>
                    }

                </form>} 
                {formStep == 1 &&
                <div className="form-group row">
                    <div className="col-12" style={{textAlign:"center"}}>
                        LINK HERE
                    </div>
                </div>}
            
        </>
    )
}

export default AuthForm
