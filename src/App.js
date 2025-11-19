// src/App.js
import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports"; // This file is auto-generated

Amplify.configure(awsExports);
const API_URL ='https://ait7emkdle.execute-api.eu-north-1.amazonaws.com/prod/items';
function App({ signOut, user }) {
  const [itemName, setItemName] = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [itemStatus, setItemStatus] = useState("In Stock");
  const [statusMessage, setStatusMessage] = useState("Ready to log inventory.");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !itemLocation) {
      setStatusMessage("Please fill out Item Name and Location.");
      return;
    }
    setStatusMessage("Logging item...");
    try {
      // Synchronous API Call to your new API Gateway URL
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Amplify handles auth headers automatically if configured, but for simplicity, we
        },
        body: JSON.stringify({
          item: itemName,
          location: itemLocation,
          status: itemStatus,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatusMessage(`
✅ Log successful! ${data.message}`);
        setItemName("");
        setItemLocation("");
      } else {
        setStatusMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("API Error:", error);
      setStatusMessage("Critical error communicating with the server.");
    }
  };
  return (
    <div className="card">
      <h1>Inventory Status Logger</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Item Name:</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            value={itemLocation}
            onChange={(e) => setItemLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            value={itemStatus}
            onChange={(e) => setItemStatus(e.target.value)}
          >
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Needs Repair">Needs Repair</option>
          </select>
        </div>
        <button type="submit">Submit Item Status</button>
      </form>
      <p className="status-message">Status: {statusMessage}</p>
      <button onClick={signOut} style={{ marginTop: "20px" }}>
        Sign Out
      </button>
    </div>
  );
}
export default withAuthenticator(App);
