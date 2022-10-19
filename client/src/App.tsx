import './App.css';
import React, { useState, useEffect } from 'react';


function App() {

  const [data, setData] = useState("");

  function getData() {
    fetch('/api/test')
      .then(res => res.json())
      .then(json => setData(json.data));
  }

  useEffect(() => {
    getData();
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {data}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
