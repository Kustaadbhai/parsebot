document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const query = document.getElementById('query').value;
    
    fetch('/chatbot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })
    .then(response => response.text())
    .then(reply => {
        document.getElementById('response').textContent = 'Reply: ' + reply;
    })
    .catch(error => console.error('Error:', error));
});