import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Axios from "axios";

function Forgot(props) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const [emailSent, setEmailSent] = useState(false);

    /**
     * Handles submission
    */
    const submitRecovery = (e) => {
        Axios.post("forgot", {
            email: e.email,
        }).then((response) => {
            setEmailSent(true);
        });
    }

    if (!emailSent) {
        return (
            <div>
                <h1>Password Recovery</h1>

                <form method="post" onSubmit={handleSubmit(submitRecovery)}>
                    <div className="input-box">
                        E-mail:
                        <input
                            {...register("email", {
                                required: "Please enter an e-mail address.",
                                pattern: {
                                    value: /\S+@\S+\.\S+/,
                                    message: "Enter a valid e-mail address."
                                }
                            })}
                            type="text" />

                        {errors.email && <span role="form-error">{errors.email.message}</span>}
                    </div>

                    <div className="input-box">
                        <button type="submit">Recover</button>
                    </div>
                </form>
            </div>
        );
    } else {
        return (
            <div>
                <p>Password recovery e-mail sent.</p>
            </div>
        );
    }
}

export default Forgot;