import { useState, useEffect } from 'react'
import CircularProgress from '../node_modules/@mui/material/CircularProgress';
import * as Constants from './assets/Constants';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';


function SuggestionForm({ token }) {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [nameFirst, setNameFirst] = useState("");
    const [nameLast, setNameLast] = useState("");
    const [format, setFormat] = useState(0);
    const [formStep, setFormStep] = useState(0)
    const [submitButton, setSubmitButton] = useState(<button name="submit" type="submit" className="btn btn-primary">Submit</button>);

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

    async function submitform(event) {
        event.preventDefault();

        if (formStep) {
            setSubmitButton(
                <div>
                    <CircularProgress />
                </div>
            )
            const form = event.target;
            const formData = new FormData(form);
            const data = {};

            formData.forEach((value, key) => {
                data[key] = value;
            });

            data["status"] = 0;
            data["barcode"] = username;
            var json = JSON.stringify(data);
            console.log(json);
            const response = await fetch("/PHP/asap/AddTitleRequest.php", {
                method: "POST",
                body: json,
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            if (!response.ok) {
                // If response.ok is false, it means the HTTP status code is not in the 2xx range.
                const errorData = await response.text(); // Attempt to parse error details from the response body
                if (response.status === 409) {
                    setFormStep(409); /*Dupe handling*/
                }
                else if (response.status === 406) {
                    setSubmitButton(<><div style={{fontWeight:"bold", }}>You have submitted 5 suggestions this week. Please try again on Monday.</div></>)
                    //setFormStep(409); /*Dupe handling*/
                }else{
                    setSubmitButton(<><div>Error. Please try again</div><button name="submit" type="submit" className="btn btn-primary">Submit</button></>)

                }
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
            } else {
                setSubmitButton(<button name="submit" type="submit" className="btn btn-primary">Submit</button>)
                setFormStep(2);
            }
        } else {
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
    }

    return (
        <>
            {formStep == 0 &&
                <div className="form-group row">
                    <label htmlFor="barcode" className="col-5 col-form-label" style={{ color: "#fff" }}>.</label>
                    <div className="col-7">
                        Please enter your information below to start the suggestion process.
                    </div>
                </div>
            }
            {formStep <= 1 &&
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

                    {formStep == 1 &&
                        <div className="form-group row">
                            <label htmlFor="email" className="col-5 col-form-label">Email</label>
                            <div className="col-7" style={{ "textAlign": "left", alignItems: "center", display: "flex" }}>
                                {!email &&
                                    <div>
                                        <p>
                                            No email is specified on your library account, which means we won't be able to send you updates regarding your suggestion.
                                        </p>
                                        <p>
                                            To add an email address, <a href="https://jaxpl.na4.iiivega.com/?openAccount=profile">login to your account</a>. Need help? Email <a href="mailto:JPLInfoSvcs@coj.net">JPLInfoSvcs@coj.net</a> or call 904-255-2665.
                                        </p>
                                    </div>}
                                {email &&
                                    <span>
                                        {email}
                                    </span>}
                                <input id="email" name="email" type="hidden" required="required" value={email} className="form-control" />
                                <input id="nameFirst" name="nameFirst" type="hidden" required="required" value={nameFirst} className="form-control" />
                                <input id="nameLast" name="nameLast" type="hidden" required="required" value={nameLast} className="form-control" />
                            </div>
                        </div>}

                    {formStep == 1 &&
                        <div className="form-group row reqAuth">
                            <label htmlFor="format" className="col-5 col-form-label">Format *</label>
                            <div className="col-7">
                                <select id="format" name="format" className="custom-select" value={format} onChange={(e) => { setFormat(e.target.value) }}>
                                    <option value="0">{Constants.formats[0]}</option>{/*Book*/}
                                    <option value="2">{Constants.formats[2]}</option>{/*Audiobook (Physical CD)*/}
                                    <option value="4">{Constants.formats[4]}</option>{/*DVD*/}
                                    <option value="5">{Constants.formats[5]}</option>{/*CD*/}
                                    <option value="1">{Constants.formats[1]}</option>{/*eBook*/}
                                    <option value="3">{Constants.formats[3]}</option>{/*eAudiobook*/}
                                </select>
                            </div>
                        </div>}

                    {(formStep == 1 && (format != 1 && format != 3) /*Check if the format is ebook*/) &&
                        <div className="form-group row reqAuth">
                            <label htmlFor="author" className="col-5 col-form-label">{Constants.creator[format]} *</label>
                            <div className="col-7">
                                <input id="author" name="author" type="text" className="form-control" required="required" />
                            </div>
                        </div>}

                    {(formStep == 1 && (format != 1 && format != 3) /*Check if the format is ebook  */) &&
                        <div className="form-group row reqAuth">
                            <label htmlFor="title" className="col-5 col-form-label">Title *</label>
                            <div className="col-7">
                                <input id="title" name="title" type="text" className="form-control" required="required" />
                            </div>
                        </div>}


                    {(formStep == 1 && (format == 0 || format == 2) /*only show ISBN for books */) &&
                        <div className="form-group row reqAuth">
                            <label htmlFor="isbn" className="col-5 col-form-label">ISBN</label>
                            <div className="col-7">
                                <input id="isbn" name="isbn" type="text" className="form-control" />
                            </div>
                        </div>}

                    {(formStep == 1 && (format != 1 && format != 3) /*Check if the format is ebook */) &&
                        <div className="form-group row reqAuth">
                            <label htmlFor="agegroup" className="col-5 col-form-label">Age Group *</label>
                            <div className="col-7">
                                <select id="agegroup" name="agegroup" className="custom-select">
                                    <option value="0">Adult</option>
                                    <option value="1">Teen</option>
                                    <option value="2">Children</option>
                                </select>
                            </div>
                        </div>}

                    {(formStep == 1 && (format != 1 && format != 3) /*Check if the format is ebook */) &&
                        <div className="form-group row reqAuth">
                            <label htmlFor="publication" className="col-5 col-form-label">{(format == 4 || format == 5) && "Release"} {!(format == 4 || format == 5) && "Publication"} Date *{/*Check if the format is DVD */}</label>
                            <div className="col-7">
                                <input id="publication" name="publication" type="date" max="2030-12-31" className="form-control" required="required" />
                            </div>
                        </div>}

                    {(formStep == 1 && (format != 1 && format != 3) /*Check if the format is ebook */) &&
                        <div className="form-group row reqAuth">
                            <label className="col-5">Note</label>
                            <div className="col-7" style={{ textAlign: "left" }}>
                                If the Jacksonville Public Library decides to purchase your suggestion, we will automatically
                                place a hold on it and send a confirmation email based on the above form.<br />
                                Make sure to check your spam folder if you don't see the email.
                            </div>
                        </div>}

                    {(format != 1 && format != 3) &&
                        <div className="form-group row">
                            <div className="offset-4 col-7 buttonsContainer">
                                {formStep == 1 &&
                                    <button name="cancel" className="btn btn-outline-secondary" style={{ "marginRight": "8px" }} onClick={function () { setFormStep(0); setFormat(0); }}>Cancel</button>
                                }
                                {submitButton}
                            </div>
                        </div>
                    }

                    {(format == 1 || format == 3) &&
                        <div className="form-group row">
                            <div className="offset-4 col-7">
                                <p>
                                    This is an eBook suggestion, please use Libby to notify us of your interest.
                                </p>
                                <p>
                                    <a href="https://help.libbyapp.com/en-us/6260.htm" target='_blank'>Learn how to suggest a purchase using Libby here.</a>
                                </p>
                                {formStep == 1 &&
                                    <p>
                                        <button name="cancel" className="btn btn-outline-secondary" style={{ "marginRight": "8px" }} onClick={function () { setFormStep(0); setFormat(0); }}>Cancel</button>
                                    </p>
                                }
                            </div>
                        </div>
                    }

                </form>}
            {formStep == 2 &&
                <div className="row">
                    <div className="col-5" style={{ "textAlign": "right" }}>
                        <CheckIcon color="success" fontSize="large" />
                    </div>
                    <div className="col-7" >
                        <div style={{ marginBottom: "8px" }}>
                            You have successfully submitted your material suggestion! Check your email inbox for status updates.
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                            Thank you for using this free service of the Jacksonville Public Library.
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                            <button name="restart" className="btn btn-outline-secondary" style={{ "marginRight": "8px" }} onClick={function () { setFormStep(0) }}>Submit another suggestion</button>
                        </div>
                    </div>
                </div>
            }
            {formStep == 409 &&
                <div className="row">
                    <div className="col-5" style={{ "textAlign": "right" }}>
                        <ErrorIcon color="warning" fontSize="large" />
                    </div>
                    <div className="col-7" >
                        <div style={{ marginBottom: "8px" }}>
                            This suggestion has already been submitted. We only accept one suggestion per title. Check the catelog to see if the material was acqiured and place a hold.
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                            Thank you for using this free service of the Jacksonville Public Library.
                        </div>
                        <div style={{ marginBottom: "8px" }}>
                            <button name="restart" className="btn btn-outline-secondary" style={{ "marginRight": "8px" }} onClick={function () { setFormStep(0) }}>Submit another suggestion</button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default SuggestionForm
