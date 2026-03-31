const CART_STORAGE_KEY = "artbyte_cart";
const DEFAULT_PRODUCT_IMAGE =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

let produtosCatalogo = [];

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

function aplicarPermissoesNaTela() {
    const botaoNovoProduto = document.getElementById("novoProdutoButton");
    const adminPanel = document.getElementById("adminPanel");

    if (botaoNovoProduto) {
        botaoNovoProduto.style.display = isAdmin() ? "inline-flex" : "none";
    }

    if (adminPanel) {
        adminPanel.classList.toggle("hidden", !isAdmin());
    }
}

async function listarProdutos() {
    if (!requireAuth()) {
        return;
    }

    const catalogo = document.getElementById("catalogoProdutos");
    const catalogoVazio = document.getElementById("catalogoVazio");
    const catalogInfo = document.getElementById("catalogInfo");

    catalogo.innerHTML = "";
    catalogoVazio.classList.add("hidden");

    try {
        const data = await apiRequest("/dw/produtos/catalogo", "GET");
        produtosCatalogo = data?.dados || [];
        renderizarCatalogo(produtosCatalogo);
        catalogInfo.textContent = `${produtosCatalogo.length} itens encontrados`;
    } catch (error) {
        if (error.status === 401) {
            showToast("Sua sessao expirou. Faca login novamente.", "error");
            setTimeout(() => redirectToLogin(), 800);
            return;
        }

        catalogInfo.textContent = "Falha ao carregar";
        catalogoVazio.classList.remove("hidden");
        catalogoVazio.textContent = error.mensagem || "Erro ao carregar produtos.";
    }
}

function renderizarCatalogo(produtos) {
    const catalogo = document.getElementById("catalogoProdutos");
    const catalogoVazio = document.getElementById("catalogoVazio");

    catalogo.innerHTML = "";

    if (!produtos.length) {
        catalogoVazio.classList.remove("hidden");
        return;
    }

    catalogoVazio.classList.add("hidden");

    produtos.forEach((produto) => {
        const card = document.createElement("article");
        card.className = "product-market-card";

        const imagem = document.createElement("img");
        imagem.className = "product-market-image";
        imagem.src = produto.imagemUrl || DEFAULT_PRODUCT_IMAGE;
        imagem.alt = produto.nome;
        imagem.onerror = () => {
            imagem.src = DEFAULT_PRODUCT_IMAGE;
        };

        const body = document.createElement("div");
        body.className = "product-market-body";

        const nome = document.createElement("h3");
        nome.textContent = produto.nome;

        const estoque = document.createElement("p");
        estoque.className = "product-market-stock";
        estoque.textContent = produto.disponivel
            ? `Em estoque: ${produto.quantidade}`
            : "Indisponivel no momento";

        const preco = document.createElement("strong");
        preco.className = "product-market-price";
        preco.textContent = formatarMoeda(produto.preco || 0);

        const actions = document.createElement("div");
        actions.className = "product-market-actions";

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "button-primary";
        addButton.textContent = "Adicionar ao carrinho";
        addButton.disabled = !produto.disponivel;
        addButton.onclick = () => adicionarAoCarrinho(produto);

        actions.appendChild(addButton);

        if (isAdmin()) {
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "button-secondary";
            editButton.textContent = "Editar";
            editButton.onclick = () => editarProduto(produto);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "button-danger";
            deleteButton.textContent = "Excluir";
            deleteButton.onclick = () => deletarProduto(produto.id);

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
        }

        body.appendChild(nome);
        body.appendChild(estoque);
        body.appendChild(preco);
        body.appendChild(actions);

        card.appendChild(imagem);
        card.appendChild(body);
        catalogo.appendChild(card);
    });
}

function filtrarProdutos() {
    const termo = document.getElementById("searchInput").value.trim().toLowerCase();
    const filtrados = produtosCatalogo.filter((produto) =>
        produto.nome.toLowerCase().includes(termo)
    );
    renderizarCatalogo(filtrados);
    document.getElementById("catalogInfo").textContent = `${filtrados.length} itens encontrados`;
}

function adicionarAoCarrinho(produto) {
    const cart = getCart();
    const existente = cart.find((item) => item.id === produto.id);

    if (existente) {
        existente.quantidade += 1;
    } else {
        cart.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagemUrl: produto.imagemUrl || DEFAULT_PRODUCT_IMAGE,
            quantidade: 1
        });
    }

    saveCart(cart);
    atualizarCarrinho();
    showToast("Produto adicionado ao carrinho.", "success");
}

function removerDoCarrinho(produtoId) {
    const cart = getCart().filter((item) => item.id !== produtoId);
    saveCart(cart);
    atualizarCarrinho();
}

function alterarQuantidadeCarrinho(produtoId, delta) {
    const cart = getCart()
        .map((item) => {
            if (item.id === produtoId) {
                return { ...item, quantidade: item.quantidade + delta };
            }
            return item;
        })
        .filter((item) => item.quantidade > 0);

    saveCart(cart);
    atualizarCarrinho();
}

function limparCarrinho() {
    saveCart([]);
    atualizarCarrinho();
}

function atualizarCarrinho() {
    const cart = getCart();
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    cartItems.innerHTML = "";

    if (!cart.length) {
        cartItems.innerHTML = '<p class="cart-empty">Seu carrinho esta vazio.</p>';
        cartCount.textContent = "0";
        cartTotal.textContent = formatarMoeda(0);
        return;
    }

    let totalItens = 0;
    let totalValor = 0;

    cart.forEach((item) => {
        totalItens += item.quantidade;
        totalValor += item.preco * item.quantidade;

        const row = document.createElement("div");
        row.className = "cart-item";

        const imagem = document.createElement("img");
        imagem.className = "cart-item-image";
        imagem.src = item.imagemUrl || DEFAULT_PRODUCT_IMAGE;
        imagem.alt = item.nome;

        const info = document.createElement("div");
        info.className = "cart-item-info";

        const nome = document.createElement("strong");
        nome.textContent = item.nome;

        const preco = document.createElement("span");
        preco.textContent = formatarMoeda(item.preco);

        const controls = document.createElement("div");
        controls.className = "cart-item-controls";

        const minus = document.createElement("button");
        minus.type = "button";
        minus.className = "button-secondary small";
        minus.textContent = "-";
        minus.onclick = () => alterarQuantidadeCarrinho(item.id, -1);

        const qtd = document.createElement("span");
        qtd.textContent = item.quantidade;

        const plus = document.createElement("button");
        plus.type = "button";
        plus.className = "button-secondary small";
        plus.textContent = "+";
        plus.onclick = () => alterarQuantidadeCarrinho(item.id, 1);

        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "button-danger small";
        remover.textContent = "Remover";
        remover.onclick = () => removerDoCarrinho(item.id);

        controls.appendChild(minus);
        controls.appendChild(qtd);
        controls.appendChild(plus);
        controls.appendChild(remover);

        info.appendChild(nome);
        info.appendChild(preco);
        info.appendChild(controls);

        row.appendChild(imagem);
        row.appendChild(info);
        cartItems.appendChild(row);
    });

    cartCount.textContent = String(totalItens);
    cartTotal.textContent = formatarMoeda(totalValor);
}

function finalizarCompra() {
    const cart = getCart();

    if (!cart.length) {
        showToast("Adicione itens ao carrinho primeiro.", "error");
        return;
    }

    showToast("Pedido fechado com sucesso.", "success");
    limparCarrinho();
}

async function salvarProduto() {
    if (!requireAdmin()) {
        return;
    }

    const id = document.getElementById("produtoId").value;
    const nome = document.getElementById("produtoNome").value.trim();
    const preco = parseFloat(document.getElementById("produtoPreco").value);
    const quantidade = parseInt(document.getElementById("produtoQuantidade").value, 10);
    const imagemUrl = document.getElementById("produtoImagemUrl").value.trim();

    if (!nome || Number.isNaN(preco) || Number.isNaN(quantidade)) {
        showToast("Preencha todos os campos corretamente.", "error");
        return;
    }

    const body = { nome, preco, quantidade, imagemUrl };

    try {
        const endpoint = id ? `/produtos/${id}` : "/produtos";
        const method = id ? "PUT" : "POST";
        const data = await apiRequest(endpoint, method, body);

        showToast(data.mensagem || "Produto salvo com sucesso.", "success");
        resetarFormulario();
        ocultarFormulario();
        listarProdutos();
    } catch (error) {
        showToast(error.mensagem || "Erro ao salvar produto.", "error");
    }
}

function editarProduto(produto) {
    if (!requireAdmin()) {
        return;
    }

    const form = document.getElementById("product-form");
    const panel = document.getElementById("adminPanel");

    panel.classList.remove("hidden");
    form.classList.remove("hidden", "add-mode");
    form.classList.add("edit-mode");

    document.getElementById("produtoId").value = produto.id;
    document.getElementById("produtoNome").value = produto.nome;
    document.getElementById("produtoPreco").value = produto.preco;
    document.getElementById("produtoQuantidade").value = produto.quantidade;
    document.getElementById("produtoImagemUrl").value = produto.imagemUrl || "";
    document.getElementById("submitButton").textContent = "Atualizar";
    document.getElementById("formTitle").textContent = "Editar produto";
    document.getElementById("formNote").textContent = "Atualize as informacoes do item no catalogo.";
}

function mostrarFormularioAdd() {
    if (!requireAdmin()) {
        return;
    }

    const panel = document.getElementById("adminPanel");
    const form = document.getElementById("product-form");

    panel.classList.remove("hidden");
    form.classList.remove("hidden", "edit-mode");
    form.classList.add("add-mode");
    limparCampos();
    document.getElementById("submitButton").textContent = "Adicionar";
    document.getElementById("formTitle").textContent = "Adicionar produto";
    document.getElementById("formNote").textContent = "Cadastre um novo item para o catalogo.";
}

function ocultarFormulario() {
    const form = document.getElementById("product-form");
    form.classList.add("hidden");
    form.classList.remove("add-mode", "edit-mode");
}

function limparCampos() {
    document.getElementById("produtoId").value = "";
    document.getElementById("produtoNome").value = "";
    document.getElementById("produtoPreco").value = "";
    document.getElementById("produtoQuantidade").value = "";
    document.getElementById("produtoImagemUrl").value = "";
}

function resetarFormulario() {
    limparCampos();
    document.getElementById("submitButton").textContent = "Adicionar";
    document.getElementById("formTitle").textContent = "Adicionar produto";
    document.getElementById("formNote").textContent = "Cadastre produtos com imagem, preco e estoque.";
}

async function deletarProduto(id) {
    if (!requireAdmin()) {
        return;
    }

    if (!confirm("Tem certeza que deseja excluir este produto?")) {
        return;
    }

    try {
        const data = await apiRequest(`/produtos/${id}`, "DELETE");
        showToast(data.mensagem || "Produto excluido com sucesso.", "success");
        listarProdutos();
    } catch (error) {
        showToast(error.mensagem || "Erro ao excluir produto.", "error");
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor || 0);
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

window.addEventListener("load", () => {
    if (!requireAuth()) {
        return;
    }

    aplicarPermissoesNaTela();
    ocultarFormulario();
    atualizarCarrinho();
    listarProdutos();
});
