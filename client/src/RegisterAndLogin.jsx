import { useState, useContext } from "react";
import { UserContext } from "./UserContextProvider";
import axios from "axios";

const RegisterAndLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginOrRegister, setLoginOrRegister] = useState("register");

  const {setUser, setId} = useContext(UserContext);

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const url = loginOrRegister === "register" ? "/register" : "/login";
        // axios handles the promise itself -> the data is available as property
        const {data} =  await axios.post(url, {
        username,
        password,
      });
      console.log(data);
      setUser(username);
      setId(data?.id);
    } catch(err) {
      console.log("registration failed " + err);
    }
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          value={username}
          name="username"
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="username"
          required
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          name="password"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          required
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white capitalize py-2 block w-full rounded-sm"
        >
          {loginOrRegister}
        </button>
        {loginOrRegister === "register" ? (
          <div className="text-center mt-2">
            Already a member?{" "}
            <button
              onClick={() => {
                setLoginOrRegister("login");
              }}
            >
              Login
            </button>
          </div>
        ) : (
          <div className="text-center mt-2">
            Don't have an account?{" "}
            <button
              onClick={() => {
                setLoginOrRegister("register");
              }}
            >
              Register
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
export default RegisterAndLogin;