const API_URL = "http://localhost:8080";

async function apiRequest(endpoint, method, body) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + endpoint, options);
    return response.json();
}