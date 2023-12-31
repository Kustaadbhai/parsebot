// Import the necessary libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const natural = require('natural');  // Add this line to use the 'natural' library

// Create an express application
const app = express();

// Import the TF-IDF function from the 'natural' library
const TfIdf = natural.TfIdf;

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Your OpenAI API key
const apiKey = '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';

// Async function to make the OpenAI API request
async function makeApiRequest(systemMessage, userMessage) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        userMessage
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(response.data);
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('An error occurred while processing the request:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return 'An error occurred while processing the request: ' + error.message;
  }
}

// Function to retrieve relevant sections of the document
function getRelevantSections(text, query) {
  // Use the 'natural' library's tokenizer to split the text into sentences
  const tokenizer = new natural.SentenceTokenizer();
  const sentences = tokenizer.tokenize(text);

  const tfidf = new TfIdf();

  // Add each sentence to the TF-IDF instance
  sentences.forEach(sentence => tfidf.addDocument(sentence));

  // Extract keywords from the query
  const keywords = query.split(' ');

  // Find the top 5 sentences for each keyword
  let relevantSentences = [];
  keywords.forEach(keyword => {
    tfidf.tfidfs(keyword, function(i, measure) {
      if (measure > 0) {
        relevantSentences.push(sentences[i]);
      }
    });
  });

  // Sort the sentences by their TF-IDF measure
  relevantSentences.sort((a, b) => tfidf.tfidf(b, 0) - tfidf.tfidf(a, 0));

  // Take the top 10 sentences
  relevantSentences = relevantSentences.slice(0, 10);

  // Combine the relevant sentences back into a string
  const relevantText = relevantSentences.join(' ');

  return relevantText;
}

// Async function to create a chatbot using OpenAI
async function chatbotWithPDF(filePath, query) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const relevantText = getRelevantSections(pdfData.text, query);
    console.log(relevantText);

    const systemMessage = {
      role: 'system',
      content: relevantText,
    };

    const userMessage = {
      role: 'user',
      content: query,
    };

    const chatbotResponse = await makeApiRequest(systemMessage, userMessage);
    return chatbotResponse;
  } catch (error) {
    console.error('Error:', error.message);
    return 'An error occurred while processing the request: ' + error.message;
  }
}

// POST endpoint to process the form submission
app.post('/chatbot', async (req, res) => {
  const query = req.body.query;
  
  // Use the relative path to the PDF file
  const filePath = path.join(__dirname, 'public', 'new.pdf');

  const chatbotResponse = await chatbotWithPDF(filePath, query);
  res.send(chatbotResponse);
});

// Start the server
let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Example app listening on port ' + port + '!');
});
