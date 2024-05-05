// global context provider
import {useState, createContext, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

const UserContextProvider = ({children}) => {

  const [user, setUser] = useState(null);
  const [id, setId] = useState(null);

  // if already logged-in (contains jwt in client)
  // get the particular user profile/data
  useEffect(() => {
    const checkLoggedIn = async () => {
      const { data } = await axios.get("/profile");
      setId(data.userId);
      setUser(data.username);
    }
    
    checkLoggedIn();
  }, []);

  return (
    <UserContext.Provider value={{
      user, setUser, id, setId
    }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserContextProvider;