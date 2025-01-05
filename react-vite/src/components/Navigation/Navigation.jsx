import { NavLink } from "react-router-dom";
import ProfileButton from "./ProfileButton";
import { useSelector } from "react-redux";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.session.user)
  return (
    <ul>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      {user && (
        <li>
          <NavLink to="/your-links">Your Links</NavLink>
        </li>
      )}
      <li>
        <ProfileButton />
      </li>
    </ul>
  );
}

export default Navigation;
