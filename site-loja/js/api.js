const API_URL = "http://localhost:8080";
const AUTH_STORAGE_KEY = "artbyte_auth";

function getAuthData() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

function saveAuthData(authData) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

function clearAuthData() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getToken() {
    return getAuthData()?.token || null;
}

function getUserRole() {
    return getAuthData()?.role || null;
}

function isAdmin() {
    return getUserRole() === "ADMIN";
}

function isAuthenticated() {
    return Boolean(getToken());
}

function redirectToLogin() {
    window.location.href = "../index.html";
}

function requireAuth() {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }

    return true;
}

function requireAdmin() {
    if (!requireAuth()) {
        return false;
    }

    if (!isAdmin()) {
        alert("Apenas administradores podem fazer esta acao.");
        return false;
    }

    return true;
}

async function apiRequest(endpoint, method = "GET", body) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body !== undefined && body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + endpoint, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : { status: "erro", mensagem: await response.text() };

    if (response.status === 401) {
        clearAuthData();
    }

    if (!response.ok) {
        throw {
            status: response.status,
            ...data
        };
    }

    return data;
}
