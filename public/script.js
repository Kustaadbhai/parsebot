document.getElementById('queryForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const query = document.getElementById('query').value;
    const chatBox = document.getElementById('chatBox');

    const userMessageElem = document.createElement('div');
    userMessageElem.className = 'message user-message';
    userMessageElem.innerHTML = `<div class="message-content">${query}</div>`;
    chatBox.appendChild(userMessageElem);

    fetch('/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.text())
    .then(reply => {
        const botMessageElem = document.createElement('div');
        botMessageElem.className = 'message bot-message';
        botMessageElem.innerHTML = `<div class="message-content">${reply}</div>`;
        chatBox.appendChild(botMessageElem);
        // Scroll to the bottom of the chat container
        chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch(error => console.error('Error:', error));

    // Clear the input field
    document.getElementById('query').value = '';
});
