const API_URL = window.ARTBYTE_API_URL || "https://api-loja-java-production.up.railway.app";
const AUTH_STORAGE_KEY = "artbyte_auth";
const CART_STORAGE_KEY = "artbyte_cart";

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

function mergeAuthData(partialData) {
    const current = getAuthData() || {};
    saveAuthData({ ...current, ...partialData });
}

function clearAuthData() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getToken() {
    return getAuthData()?.token || null;
}

function getCurrentUser() {
    return getAuthData();
}

function getUserName() {
    const authData = getAuthData();
    if (authData?.nome && authData.nome.trim()) {
        return authData.nome.trim();
    }

    if (authData?.email) {
        return authData.email.split("@")[0];
    }

    return "Usuario";
}

function getUserEmail() {
    return getAuthData()?.email || "";
}

function getUserPhoto() {
    return getAuthData()?.fotoUrl || "";
}

function getUserPhotoZoom() {
    return getAuthData()?.fotoZoom ?? 1;
}

function getUserPhotoPosX() {
    return getAuthData()?.fotoPosX ?? 50;
}

function getUserPhotoPosY() {
    return getAuthData()?.fotoPosY ?? 50;
}

function getUserInitials() {
    const nome = getUserName().trim();

    if (!nome) {
        return "U";
    }

    const partes = nome.split(/\s+/).filter(Boolean);

    if (partes.length === 1) {
        return partes[0].slice(0, 2).toUpperCase();
    }

    return (partes[0][0] + partes[1][0]).toUpperCase();
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
    window.location.href = "../../index.html";
}

function logout() {
    clearAuthData();
    clearCart();
    redirectToLogin();
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

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (error) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function clearCart() {
    saveCart([]);
}

function getCartCount() {
    return getCart().reduce((acc, item) => acc + (item.quantidade || 0), 0);
}

async function syncCurrentUser() {
    if (!isAuthenticated()) {
        return null;
    }

    try {
        const data = await apiRequest("/auth/me", "GET");
        const usuario = data?.dados;

        if (usuario) {
            mergeAuthData({
                id: usuario.id ?? null,
                nome: usuario.nome ?? null,
                email: usuario.email ?? null,
                fotoUrl: usuario.fotoUrl ?? null,
                fotoZoom: usuario.fotoZoom ?? 1,
                fotoPosX: usuario.fotoPosX ?? 50,
                fotoPosY: usuario.fotoPosY ?? 50,
                role: usuario.role ?? null
            });
        }

        return usuario || null;
    } catch (error) {
        return null;
    }
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
