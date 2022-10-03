import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState } from "react";
import Axios from "axios";

function Login(props) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    /**
     * Checks to see if the user attempted to log in
     */
    const [logAttempt, setLogAttempt] = useState(true);

    // Navigation
    const navigate = useNavigate();
    const location = useLocation();

    const submitLogin = (event) => {
        Axios.post("login", {
            info: event,
        }).then((response) => {
            if (response.data.auth) {
                // Check account type
                if (response.data.result[0].accountType == 1) {
                    props.setAccountType(true);
                }
                props.setIsLoggedIn(true);
                setLogAttempt(true);
                navigate("/");
            } else {
                setLogAttempt(false);
            }
        });
    };

    return (
        <div>
            <form method="POST" onSubmit={handleSubmit(submitLogin)}>
                <div className="input-box">
                    E-mail: <input {...register("email", { required: "Enter your e-mail." })} type="text" />

                    {errors.email && <span role="form-error">{errors.email.message}</span>}
                </div>

                <div className="input-box">
                    Password: <input {...register("password", { required: "Enter your password." })} type="password" />

                    {errors.password && <span role="form-error">{errors.password.message}</span>}
                </div>

                <div className="input-box">
                    <button type="submit">Login</button>
                </div>

                {!logAttempt &&
                    <span role="form-error">Incorrect e-mail and/or password.</span>
                }
            </form>
        </div>
    );
}

export default Login;