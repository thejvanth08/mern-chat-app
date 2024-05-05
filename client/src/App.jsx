import axios from "axios";
import Routes from "./Routes";
import UserContextProvider from "./UserContextProvider";

// setting the default config of axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:3000";

function App() {

  return (
  
      <UserContextProvider>
        <Routes></Routes>
      </UserContextProvider>
  )
}

export default App
