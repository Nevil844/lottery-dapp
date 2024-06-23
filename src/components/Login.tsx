import React from "react";
import { useMetamask } from "@thirdweb-dev/react";

function Login() {
  const connectWithMetamask = useMetamask();

  const handleClick = (event:any) => {
    connectWithMetamask(); // Call connectWithMetamask function when button is clicked
  };

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center mb-10">
        <img
          className="rounded-full h-56 w-56 mb-10"
          src="https://static.displate.com/brand/layout/82c9846f-d928-45ff-a95e-0ab53d87f4e4/avatarStandard.jpg"
          alt=""
        />
        <h1 className="text-6xl text-white font-bold">THE JACKPOT JUNCTION</h1>
        <h2 className="text-white">Get Started By logging in with your MetaMask</h2>
        <button
          onClick={handleClick} // Use handleClick function as onClick event handler
          className="bg-white px-8 py-5 mt-10 rounded-lg shadow-lg font-bold"
        >
          Login with Metamask
        </button>
      </div>
    </div>
  );
}

export default Login;
