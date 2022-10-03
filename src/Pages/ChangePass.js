import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Axios from "axios";

function ChangePass(props) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

    /**
     * When password is changed, show message
     */
    const [passwordChanged, setPasswordChanged] = useState(false);

    /**
     * Handles submission
    */
    const submitChange = (e) => {
        Axios.post("changepass", {
            oldpassword: e.oldpassword,
            newpassword: e.newpassword,
        }).then((response) => {
            setValue('oldpassword', '');
            setValue('newpassword', '');
            setValue('newpasswordc', '');

            setPasswordChanged(true);
        });
    }

    if (!passwordChanged) {
        return (
            <div>
                <h1>Change Password</h1>

                <form method="post" onSubmit={handleSubmit(submitChange)}>
                    <div className="input-box">
                        Old Password:
                        <input
                            {...register("oldpassword", {
                                required: "Please enter old password.",
                            })}
                            type="password"
                            maxLength="32" />

                        {errors.oldpassword && <span role="form-error">{errors.oldpassword.message}</span>}
                    </div>

                    <div className="input-box">
                        New Password:
                        <input
                            {...register("newpassword", {
                                required: "Please enter a new password.",
                                minLength: {
                                    value: 6,
                                    message: "A password must be specified and be at least six characters."
                                },
                            })}
                            type="password"
                            maxLength="32" />

                        {errors.newpassword && <span role="form-error">{errors.newpassword.message}</span>}
                    </div>

                    <div className="input-box">
                        New Password (Confirm):
                        <input
                            {...register("newpasswordc", {
                                required: "Please confirm your new password.",
                                validate: (val) => {
                                    if (watch('newpassword') != val) {
                                        return "Your passwords do not match.";
                                    }
                                }
                            })}
                            type="password"
                            maxLength="32" />

                        {errors.newpasswordc && <span role="form-error">{errors.newpasswordc.message}</span>}
                    </div>

                    <div className="input-box">
                        <button type="submit">Change Password</button>
                    </div>
                </form>
            </div>
        );
    } else {
        return (
            <div>
                <p>Password Changed!</p>
            </div>
        );
    }
}

export default ChangePass;