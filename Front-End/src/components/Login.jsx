import React from "react";

const Login = () => {
  const facebookLogin = () => {
    window.location.href = "http://localhost:5000/auth/facebook";
  };

  return (
    <div>
      <h1>Login with Facebook</h1>
      <button onClick={facebookLogin}>Login</button>
    </div>
  );
};

export default Login;
