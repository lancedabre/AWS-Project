// src/App.js
import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { uploadData } from '@aws-amplify/storage'; // <-- CORRECTED IMPORT
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

      // --- THIS IS THE CORRECTED UPLOAD LOGIC ---
      const uploadTask = uploadData({
        key: fileName,
        data: file,
        options: {
          level: 'public', // This 'public' is misleading. It means 'public' in the Amplify sense (all signed-in users)
          contentType: file.type,
        }
      });

      // Wait for the upload to complete
      await uploadTask.result;
      // --- END OF CORRECTION ---

      setStatus(`Success! Report ${fileName} submitted.`);
      setFile(null); // Clear the file input
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
      <button onClick={handleSubmitReport} style={{ marginLeft: '10px' }} disabled={!file}>
        Submit
      </button>
      <p><strong>Status:</strong> {status}</p>
      <button onClick={signOut} style={{ marginTop: '50px' }}>Sign Out</button>
    </div>
  );
}

export default withAuthenticator(App);