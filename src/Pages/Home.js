import { Link, useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";

function Home(props) {
    // Navigation
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Logs the user out
     */
    const logout = () => {
        Axios.post("logout")
            .then((response) => {
                props.setIsLoggedIn(false);
                navigate("/");
            });
    }

    return (
        <div>
            {!props.isLoggedIn &&
                <div>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                    <Link to="/forgot">Forgot Password?</Link>
                </div>
            }

            {props.isLoggedIn &&
                <div>
                    <Link to="/changepass">Change Password</Link>
                    <Link to="#/" onClick={logout}>Logout</Link>
                </div>
            }
        </div>
    );
}

export default Home;
