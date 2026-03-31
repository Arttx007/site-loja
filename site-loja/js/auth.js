async function login() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        showToast("Preencha email e senha.", "error");
        return;
    }

    try {
        const data = await apiRequest("/auth/login", "POST", { email, senha });
        const authData = normalizarRespostaLogin(data);

        if (!authData?.token) {
            showToast("Resposta de login invalida.", "error");
            return;
        }

        saveAuthData(authData);

        showToast("Login realizado com sucesso!", "success");

        setTimeout(() => {
            window.location.href = "site-loja/pages/produtos.html";
        }, 500);
    } catch (error) {
        showToast(error.mensagem || "Erro ao tentar logar", "error");
    }
}

async function cadastrar() {
    const email = document.getElementById("cadastroEmail").value.trim();
    const senha = document.getElementById("cadastroSenha").value;

    if (!email || !senha) {
        showToast("Preencha email e senha para cadastrar.", "error");
        return;
    }

    try {
        const data = await apiRequest("/auth/register", "POST", { email, senha });
        showToast(data.mensagem || "Cadastro realizado com sucesso!", "success");
        document.getElementById("email").value = email;
        document.getElementById("senha").value = "";
        document.getElementById("cadastroSenha").value = "";
        mostrarLogin();
    } catch (error) {
        showToast(error.mensagem || "Erro ao cadastrar", "error");
    }
}

function mostrarLogin() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");
    const authTitle = document.getElementById("authTitle");
    const authDescription = document.getElementById("authDescription");

    loginForm.classList.remove("hidden-auth-form");
    registerForm.classList.add("hidden-auth-form");
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    authTitle.textContent = "Entrar";
    authDescription.textContent = "Use seu email e senha para acessar o painel.";
}

function mostrarCadastro() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");
    const authTitle = document.getElementById("authTitle");
    const authDescription = document.getElementById("authDescription");

    loginForm.classList.add("hidden-auth-form");
    registerForm.classList.remove("hidden-auth-form");
    loginTab.classList.remove("active");
    registerTab.classList.add("active");
    authTitle.textContent = "Cadastrar";
    authDescription.textContent = "Crie sua conta para entrar e acessar o painel.";
}

function normalizarRespostaLogin(data) {
    const dados = data?.dados;

    if (dados && typeof dados === "object" && dados.token) {
        return {
            id: dados.id ?? null,
            email: dados.email ?? null,
            role: dados.role ?? extrairPayloadToken(dados.token)?.role ?? null,
            token: dados.token
        };
    }

    if (typeof dados === "string") {
        const payload = extrairPayloadToken(dados);
        return {
            id: null,
            email: payload?.sub ?? null,
            role: payload?.role ?? null,
            token: dados
        };
    }

    if (typeof data?.token === "string") {
        const payload = extrairPayloadToken(data.token);
        return {
            id: data.id ?? null,
            email: data.email ?? payload?.sub ?? null,
            role: data.role ?? payload?.role ?? null,
            token: data.token
        };
    }

    return null;
}

function extrairPayloadToken(token) {
    try {
        const base64 = token.split(".")[1];

        if (!base64) {
            return null;
        }

        const normalizado = base64.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(normalizado)
                .split("")
                .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
                .join("")
        );

        return JSON.parse(json);
    } catch (error) {
        return null;
    }
}

function logout() {
    clearAuthData();
    window.location.href = "../../index.html";
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
