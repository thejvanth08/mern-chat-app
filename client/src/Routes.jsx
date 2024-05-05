// this will determine which view we want to show
import RegisterAndLogin from "./RegisterAndLogin";
import { useContext } from "react";
import {UserContext} from "./UserContextProvider"
import Chat from "./Chat";

const Routes = () => {
  const {user, id} = useContext(UserContext);

  // if user is logged-in
  if(id) {
    return <Chat></Chat>;
  }

  return (

    <RegisterAndLogin  />

  )
}
export default Routes;