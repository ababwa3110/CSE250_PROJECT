document.querySelector('#logForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: document.querySelector('#name').value,
        phone: document.querySelector('#phone').value,
        host_name: document.querySelector('#host_name').value,
        purpose: document.querySelector('#purpose').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(response.ok) {
            alert(result.message);
            window.location.reload();
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error(error);
        alert("Server connection failed.");
    }
});