async function login(){
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const data = await apiRequest("/auth/login", "POST", {
        email, senha
    });

    if (data.status === "sucesso"){
        showToast("Login realizado com sucesso!", "success");
        setTimeout(() => {
            window.location.href = "pages/produtos.html";
        }, 500);
    } else {
        showToast(data.mensagem || "Erro ao tentar logar", "error");
    }
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