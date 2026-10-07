import { Outlet, Navigate } from "react-router-dom";


const PrivateRoutes = () => {
    const auth = localStorage.getItem("isAuthenticated");

    return(
        auth ? <Outlet /> : <Navigate to="/" />
    )
}

export default PrivateRoutes;