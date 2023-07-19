document.getElementById('chatForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const query = document.getElementById('query').value;
    const chatContainer = document.getElementById('chatContainer');

    const userMessageElem = document.createElement('li');
    userMessageElem.textContent = 'You: ' + query;
    userMessageElem.className = 'user-message';
    chatContainer.appendChild(userMessageElem);

    fetch('/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.text())
    .then(reply => {
        const botMessageElem = document.createElement('li');
        botMessageElem.textContent = 'Bot: ' + reply;
        botMessageElem.className = 'bot-message';
        chatContainer.appendChild(botMessageElem);
    })
    .catch(error => console.error('Error:', error));
});
