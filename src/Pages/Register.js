import { useForm } from "react-hook-form";
import React, { useState } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";

function Register(props) {
    const { register, handleSubmit, watch, setError, getValues, formState: { errors } } = useForm();

    const [accountCreated, setAccountCreated] = useState(false);

    const checkUserExist = (e) => {
        Axios.get("checkuser", {
            params: {
                email: e.email,
            }
        }).then((response) => {
            if (response.data.result) {
                setError('email', { type: 'custom', message: 'E-mail already taken!' });
            } else {
                submitRegister(e);
            }
        });
    }

    const checkForm = (e) => {
        checkUserExist(e);
    }

    const submitRegister = (e) => {
        Axios.post("register", {
            email: e.email,
            password: e.password,
        }).then((response) => {
            setAccountCreated(true);
        });
    };

    if (!accountCreated) {
        return (
            <div>
                <form method="POST" onSubmit={handleSubmit(checkForm)}>
                    <div className="input-box">
                        E-mail:
                        <input
                            {...register("email", {
                                required: "Please enter an e-mail address.",
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: "Enter a valid e-mail address."
                                },
                                validate: () => {
                                    Axios.get("checkuser", {
                                        params: {
                                            email: getValues('email'),
                                        }
                                    }).then((response) => {
                                        if (response.data.result) {
                                            setError('email', { type: 'custom', message: 'E-mail address already taken!' });
                                        }
                                    });
                                }
                            })}
                            type="text" />

                        {errors.email && <span role="form-error">{errors.email.message}</span>}
                    </div>

                    <div className="input-box">
                        Password:
                        <input
                            {...register("password", {
                                required: "Please enter a password.",
                                minLength: {
                                    value: 6,
                                    message: "A password must be specified and be at least six characters."
                                }
                            })}
                            type="password" />

                        {errors.password && <span role="form-error">{errors.password.message}</span>}
                    </div>

                    <div className="input-box">
                        Password (Confirm):
                        <input
                            {...register("passwordc", {
                                required: "Confirm your password.",
                                validate: (val) => {
                                    if (watch('password') != val) {
                                        return "Your passwords do not match.";
                                    }
                                }
                            })}
                            type="password" />

                        {errors.passwordc && <span role="form-error">{errors.passwordc.message}</span>}
                    </div>

                    <div className="input-box">
                        <button type="submit">Register</button>
                    </div>
                </form>
            </div>
        );
    } else {
        return (
            <div>
                <p className="center-content">
                    Account created! <Link to="/login/">Click here to login.</Link>
                </p>
            </div>
        )
    }
}

export default Register;