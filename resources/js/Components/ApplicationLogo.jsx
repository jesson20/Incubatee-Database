import logo from "../../images/navigatu_logo.png";
export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src={logo} // Adjust path as needed
            alt="Navigatu Logo"
            className="h-16 w-auto" // Adjust size as needed
        />
    );
}
