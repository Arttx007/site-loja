async function login() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        showToast("Preencha email e senha.", "error");
        return;
    }

    try {
        const data = await apiRequest("/auth/login", "POST", { email, senha });
        const usuario = data?.dados;

        if (!usuario?.token) {
            showToast("Resposta de login invalida.", "error");
            return;
        }

        saveAuthData({
            id: usuario.id,
            email: usuario.email,
            role: usuario.role,
            token: usuario.token
        });

        showToast("Login realizado com sucesso!", "success");

        setTimeout(() => {
            window.location.href = "pages/produtos.html";
        }, 500);
    } catch (error) {
        showToast(error.mensagem || "Erro ao tentar logar", "error");
    }
}

function logout() {
    clearAuthData();
    window.location.href = "../index.html";
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.className = `toast visible ${type}`;

    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
        toast.classList.remove("visible", "success", "error");
        toast.classList.add("hidden");
    }, 3000);
}
