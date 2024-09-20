import React from "react";
import MainTable from "./components/MainTable";
import Chatbot from "./components/Chatbot";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="left-container">
        <MainTable />
      </div>
      <div className="right-container">
        <Chatbot />
      </div>
    </div>
  );
};

export default App;
