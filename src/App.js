// src/App.js
import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Storage } from '@aws-amplify/storage'; // Correct import
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports'; // This file is auto-generated

Amplify.configure(awsExports);

function App({ signOut, user }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Ready");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmitReport = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setStatus("Uploading...");
    try {
      const fileName = `${Date.now()}-${file.name}`;

      // 'Storage.put' handles all the security and signs the request!
      await Storage.put(fileName, file, {
        contentType: file.type,
        level: 'public' // This 'public' is misleading. It means 'public' in the Amplify sense (all signed-in users)
      });

      setStatus(`Success! Report ${fileName} submitted.`);
    } catch (error) {
      console.error('Error uploading file:', error);
      setStatus("Error uploading file.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Hello, {user.username}!</h1>
      <h3>Submit Maintenance Report</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSubmitReport} style={{ marginLeft: '10px' }}>
        Submit
      </button>
      <p><strong>Status:</strong> {status}</p>
      <button onClick={signOut} style={{ marginTop: '50px' }}>Sign Out</button>
    </div>
  );
}

export default withAuthenticator(App); // Wraps your app in a Sign-in/Sign-up form