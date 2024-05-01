import Register from "./Register";
import UserContextProvider from "./UserContextProvider";
import axios from "axios";

// setting the default config of axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000";

function App() {

  return (
    <UserContextProvider>
      <Register></Register>
    </UserContextProvider>
  )
}

export default App
