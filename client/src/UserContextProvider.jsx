// global context provider
import {useState, createContext } from "react";

export const UserContext = createContext({});

const UserContextProvider = ({children}) => {

  const [user, setUser] = useState(null);
  const [id, setId] = useState(null);

  return (
    <UserContext.Provider value={{
      user, setUser, id, setId
    }}>
      {children}
    </UserContext.Provider>
  )
}
export default UserContextProvider;