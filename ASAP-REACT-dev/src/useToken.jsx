import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    //const userToken = JSON.parse(tokenString);
    return tokenString
  };

  const [token, setToken] = useState(getToken());

  const saveToken = userToken => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    console.log()
  };

  return {
      token,
      setToken: saveToken
  }
}