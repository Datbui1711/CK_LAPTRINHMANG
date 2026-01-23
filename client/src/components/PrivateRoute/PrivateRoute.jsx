import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getProfile } from "../../services/userServices";
import Loading from "../Loading";
import config from "../../config";

function PrivateRoute({ children }) {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                await getProfile();
                setAuth(true);
            } catch (err) {
                console.log(err);
                setAuth(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        return <Loading fullScreen={true} text="Đang tải..." />;
    }

    return auth ? children : <Navigate to={config.routes.login} replace />;
}

export default PrivateRoute;
