import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import your auth hook or context


const PrivateRoute = ({ children, allowedRoles }) => {


    const getUserIdFromToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Current time in seconds
        if (decodedToken.exp < currentTime) {
          // Token is expired
          localStorage.removeItem("token");
          localStorage.removeItem("isAuthenticated");
          return true;
        }else{
          return false;
        }
        
          
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("isAuthenticated");
          return true;
        }
      }
      return true;
    };
  
    const expired = getUserIdFromToken();
    


    // if(role){
    //     localStorage.setItem("User_role",role);
    // }

    if(expired){
        return <Navigate to="/" replace />;
    }
  return children;
};

export default PrivateRoute;
