function renderizarCarrinhoPagina() {
    const itemsContainer = document.getElementById("cartPageItems");
    const emptyState = document.getElementById("cartPageEmpty");
    const summaryItems = document.getElementById("summaryItems");
    const summaryTotal = document.getElementById("summaryTotal");
    const cart = getCart();

    itemsContainer.innerHTML = "";

    if (!cart.length) {
        emptyState.classList.remove("hidden");
        summaryItems.textContent = "0";
        summaryTotal.textContent = formatarMoeda(0);
        return;
    }

    emptyState.classList.add("hidden");

    let totalItens = 0;
    let totalValor = 0;

    cart.forEach((item) => {
        totalItens += item.quantidade;
        totalValor += item.preco * item.quantidade;

        const row = document.createElement("article");
        row.className = "cart-page-item";

        row.innerHTML = `
            <img class="cart-page-item-image" src="${item.imagemUrl || DEFAULT_PRODUCT_IMAGE}" alt="${item.nome}">
            <div class="cart-page-item-info">
                <strong>${item.nome}</strong>
                <span>${formatarMoeda(item.preco)}</span>
                <div class="cart-item-controls">
                    <button type="button" class="button-secondary small" data-action="minus">-</button>
                    <span>${item.quantidade}</span>
                    <button type="button" class="button-secondary small" data-action="plus">+</button>
                    <button type="button" class="button-danger small" data-action="remove">Remover</button>
                </div>
            </div>
        `;

        row.querySelector('[data-action="minus"]').onclick = () => {
            alterarQuantidadeCarrinhoBase(item.id, -1);
            renderizarCarrinhoPagina();
        };
        row.querySelector('[data-action="plus"]').onclick = () => {
            alterarQuantidadeCarrinhoBase(item.id, 1);
            renderizarCarrinhoPagina();
        };
        row.querySelector('[data-action="remove"]').onclick = () => {
            removerDoCarrinhoBase(item.id);
            renderizarCarrinhoPagina();
        };

        itemsContainer.appendChild(row);
    });

    summaryItems.textContent = String(totalItens);
    summaryTotal.textContent = formatarMoeda(totalValor);
}

function esvaziarCarrinho() {
    clearCart();
    atualizarBadgeCarrinho();
    renderizarCarrinhoPagina();
}

function irParaPagamento() {
    if (!getCart().length) {
        alert("Adicione produtos ao carrinho antes de continuar.");
        return;
    }

    window.location.href = "./pagamento.html";
}

window.addEventListener("load", async () => {
    if (!requireAuth()) {
        return;
    }

    await syncCurrentUser();
    inicializarCabecalhoLoja();
    renderizarCarrinhoPagina();
});
