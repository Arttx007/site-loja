let fotoSelecionadaDataUrl = "";

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
    fotoSelecionadaDataUrl = getUserPhoto();
    document.getElementById("configNome").value = getUserName();
    document.getElementById("configEmail").value = getUserEmail();
    document.getElementById("configSenha").value = "";
    document.getElementById("configFotoZoom").value = String(getUserPhotoZoom());
    document.getElementById("configFotoPosX").value = String(getUserPhotoPosX());
    document.getElementById("configFotoPosY").value = String(getUserPhotoPosY());
    atualizarPreviewFoto();
}

function carregarFotoSelecionada(event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        showToast("Selecione um arquivo de imagem valido.", "error");
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        fotoSelecionadaDataUrl = String(reader.result || "");
        atualizarPreviewFoto();
    };
    reader.readAsDataURL(file);
}

function atualizarPreviewFoto() {
    const preview = document.getElementById("configPhotoPreview");
    const fotoZoom = document.getElementById("configFotoZoom").value || "1";
    const fotoPosX = document.getElementById("configFotoPosX").value || "50";
    const fotoPosY = document.getElementById("configFotoPosY").value || "50";

    if (!preview) {
        return;
    }

    if (fotoSelecionadaDataUrl) {
        preview.innerHTML = `<img src="${fotoSelecionadaDataUrl}" alt="${getUserName()}" style="transform: scale(${fotoZoom}); object-position: ${fotoPosX}% ${fotoPosY}%;">`;
        preview.classList.add("has-photo");
    } else {
        preview.textContent = getUserInitials();
        preview.classList.remove("has-photo");
    }
}

async function salvarConfiguracoes() {
    const nome = document.getElementById("configNome").value.trim();
    const email = document.getElementById("configEmail").value.trim();
    const senha = document.getElementById("configSenha").value;
    const fotoZoom = parseFloat(document.getElementById("configFotoZoom").value);
    const fotoPosX = parseInt(document.getElementById("configFotoPosX").value, 10);
    const fotoPosY = parseInt(document.getElementById("configFotoPosY").value, 10);

    if (!nome || !email) {
        showToast("Nome e email sao obrigatorios.", "error");
        return;
    }

    const body = {
        nome,
        email,
        fotoUrl: fotoSelecionadaDataUrl,
        fotoZoom,
        fotoPosX,
        fotoPosY
    };

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
                fotoUrl: usuario.fotoUrl ?? null,
                fotoZoom: usuario.fotoZoom ?? 1,
                fotoPosX: usuario.fotoPosX ?? 50,
                fotoPosY: usuario.fotoPosY ?? 50,
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
