const MAX_PRODUCT_PRICE = 100000;

let produtosCatalogo = [];

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
    adicionarAoCarrinhoBase(produto);
    showToast("Produto adicionado ao carrinho.", "success");
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

    if (preco < 0) {
        showToast("O preco nao pode ser negativo.", "error");
        return;
    }

    if (preco > MAX_PRODUCT_PRICE) {
        showToast("O preco maximo permitido e R$ 100.000,00.", "error");
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

window.addEventListener("load", async () => {
    if (!requireAuth()) {
        return;
    }

    await syncCurrentUser();
    inicializarCabecalhoLoja();
    aplicarPermissoesNaTela();
    ocultarFormulario();
    listarProdutos();
});
