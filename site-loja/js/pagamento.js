function atualizarResumoPagamento() {
    const cart = getCart();
    const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);
    const totalValor = cart.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    document.getElementById("paymentItems").textContent = String(totalItens);
    document.getElementById("paymentTotal").textContent = formatarMoeda(totalValor);
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

function finalizarPagamento() {
    const nome = document.getElementById("paymentName").value.trim();
    const cartao = document.getElementById("paymentCard").value.trim();
    const validade = document.getElementById("paymentExpiry").value.trim();
    const cvv = document.getElementById("paymentCvv").value.trim();

    if (!nome || !cartao || !validade || !cvv) {
        showToast("Preencha todos os dados do pagamento.", "error");
        return;
    }

    if (!getCart().length) {
        showToast("Seu carrinho esta vazio.", "error");
        return;
    }

    clearCart();
    atualizarBadgeCarrinho();
    atualizarResumoPagamento();
    showToast("Pagamento realizado com sucesso!", "success");

    setTimeout(() => {
        window.location.href = "./produtos.html";
    }, 1200);
}

window.addEventListener("load", async () => {
    if (!requireAuth()) {
        return;
    }

    await syncCurrentUser();
    inicializarCabecalhoLoja();
    atualizarResumoPagamento();
});
