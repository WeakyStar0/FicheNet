import React from 'react';

import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet';


import './styles/App.css';

function App() {
  return (
    <div className="App">

      <Helmet>
        <title>App</title>
        <meta name="description" content="This is my app" />
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
      </Helmet>

      <Outlet />
    </div>
  );
}

export default App;
