const express = require('express');
const bodyParser = require('body-parser');
const dialogflow = require('@google-cloud/dialogflow').v2beta1; 
const cors = require('cors'); 
const path = require('path'); 

const projectId = 'yeaibot-jecm'; 
const sessionId = 'react-bot-session';
const languageCode = 'en-US';

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

app.post('/send-message', async (req, res) => {
  const { message } = req.body;

  const sessionClient = new dialogflow.SessionsClient({
    keyFilename: './yeaiBot.json',
  });
  
  const sessionPath = `projects/${projectId}/agent/sessions/${sessionId}`;

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode,
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.send(result.fulfillmentText);
  } catch (error) {
    console.error('Error querying Dialogflow:', error);
    res.status(500).send('Error communicating with the server.');
  }
});

// Serve the React build files
app.use(express.static(path.join(__dirname, 'build')));

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
