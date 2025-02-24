import { Head, Link } from "@inertiajs/react";
import logo from "../../images/navigatu_logo.png";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-base-100 flex items-center justify-center" data-theme="light">
                <div className="hero">
                    <div className="hero-content text-center flex flex-col items-center">
                        
                        {/* Logo */}
                        <img
                            src={logo}
                            alt="Navigatu Logo"
                            className="w-32 h-32 mb-4"
                        />

                        <div className="max-w-md">
                            <h1 className="text-4xl font-bold text-primary">
                                Welcome to Incubatee Database
                            </h1>
                            <p className="py-4 text-gray-600">
                                Manage and track incubatees efficiently with our platform.
                            </p>

                            {/* Authentication Links */}
                            <div className="flex justify-center gap-4 mt-4">
                                {auth.user ? (
                                    <Link
                                        href={route("profiles")}
                                        className="btn btn-primary"
                                    >
                                        Profile
                                    </Link>
                                    
                                    
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="btn btn-outline btn-primary"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="btn btn-primary"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
