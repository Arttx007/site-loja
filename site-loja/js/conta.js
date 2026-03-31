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

function preencherFormularioConta() {
    document.getElementById("configNome").value = getUserName();
    document.getElementById("configEmail").value = getUserEmail();
    document.getElementById("configSenha").value = "";
}

async function salvarConfiguracoes() {
    const nome = document.getElementById("configNome").value.trim();
    const email = document.getElementById("configEmail").value.trim();
    const senha = document.getElementById("configSenha").value;

    if (!nome || !email) {
        showToast("Nome e email sao obrigatorios.", "error");
        return;
    }

    const body = { nome, email };

    if (senha.trim()) {
        body.senha = senha;
    }

    try {
        const data = await apiRequest("/auth/me", "PUT", body);
        const usuario = data?.dados;

        if (usuario) {
            mergeAuthData({
                id: usuario.id ?? null,
                nome: usuario.nome ?? null,
                email: usuario.email ?? null,
                role: usuario.role ?? null
            });
        }

        renderizarAreaUsuario();
        preencherFormularioConta();
        showToast(data.mensagem || "Configuracoes atualizadas com sucesso.", "success");
    } catch (error) {
        showToast(error.mensagem || "Erro ao atualizar configuracoes.", "error");
    }
}

window.addEventListener("load", async () => {
    if (!requireAuth()) {
        return;
    }

    await syncCurrentUser();
    inicializarCabecalhoLoja();
    preencherFormularioConta();
});
