import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation";

const withProtectedRoute = <P extends object>(
    Component: React.ComponentType<P>
) => {
    const ProtectedComponent = (props: P) => {
        const { isLoaded, isSignedIn } = useAuth();
        const navigate = useNavigate();

        React.useEffect(() => {
            if (isLoaded && !isSignedIn) {
                navigate("/");
            }
        }, [isLoaded, isSignedIn, navigate]);

        if (!isLoaded) {
            return <LoadingAnimation />;
        }

        if (!isSignedIn) {
            return null;
        }

        return <Component {...props} />;
    };

    ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;

    return ProtectedComponent;
};

export default withProtectedRoute;