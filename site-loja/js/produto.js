async function listarProdutos() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    try {
        const data = await apiRequest("/produtos", "GET");

        if (!data || !data.dados || data.dados.length === 0) {
            lista.innerText = "Nenhum produto encontrado.";
            return;
        }

        data.dados.forEach(produto => {
            const item = document.createElement("li");
            item.className = "product-item";

            const info = document.createElement("div");
            info.className = "product-info";
            const title = document.createElement("strong");
            title.textContent = produto.nome;
            const subtitle = document.createElement("span");
            subtitle.textContent = `Quantidade: ${produto.quantidade < 1 ? "Em falta" : produto.quantidade}`;
            info.appendChild(title);
            info.appendChild(subtitle);

            const right = document.createElement("div");
            right.className = "product-right";
            const price = document.createElement("strong");
            price.textContent = `R$ ${produto.preco.toFixed(2)}`;
            const actions = document.createElement("div");
            actions.className = "product-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "button-secondary small";
            editButton.textContent = "Editar";
            editButton.onclick = () => editarProduto(produto);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "button-danger small";
            deleteButton.textContent = "Excluir";
            deleteButton.onclick = () => deletarProduto(produto.id);

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);
            right.appendChild(price);
            right.appendChild(actions);

            item.appendChild(info);
            item.appendChild(right);
            lista.appendChild(item);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        lista.innerText = "Erro ao carregar produtos. Tente novamente mais tarde.";
    }
}

async function salvarProduto() {
    const id = document.getElementById("produtoId").value;
    const nome = document.getElementById("produtoNome").value.trim();
    const preco = parseFloat(document.getElementById("produtoPreco").value);
    const quantidade = parseInt(document.getElementById("produtoQuantidade").value, 10);

    if (!nome || Number.isNaN(preco) || Number.isNaN(quantidade)) {
        showToast("Preencha todos os campos corretamente.", "error");
        return;
    }

    const body = {
        nome,
        preco,
        quantidade
    };

    try {
        const endpoint = id ? `/produtos/${id}` : "/produtos";
        const method = id ? "PUT" : "POST";
        const data = await apiRequest(endpoint, method, body);

        if (data.status === "erro") {
            showToast(data.mensagem || "Não foi possível salvar o produto.", "error");
            return;
        }

        showToast(data.mensagem || "Produto salvo com sucesso.", "success");
        resetarFormulario();
        ocultarFormulario();
        listarProdutos();
    } catch (error) {
        console.error("Erro ao salvar produto:", error);
        showToast("Erro ao salvar produto. Tente novamente.", "error");
    }
}

function editarProduto(produto) {
    mostrarFormularioEdit();
    document.getElementById("produtoId").value = produto.id;
    document.getElementById("produtoNome").value = produto.nome;
    document.getElementById("produtoPreco").value = produto.preco;
    document.getElementById("produtoQuantidade").value = produto.quantidade;
    document.getElementById("submitButton").textContent = "Atualizar";
    document.getElementById("formTitle").textContent = "Editar produto";
    document.getElementById("formNote").textContent = "Altere os dados e clique em atualizar para salvar.";
    document.getElementById("produtoNome").focus();
}

function mostrarFormularioAdd() {
    const form = document.getElementById("product-form");
    form.classList.remove("hidden", "edit-mode");
    form.classList.add("add-mode");
    limparCampos();
    document.getElementById("formTitle").textContent = "Adicionar produto";
    document.getElementById("formNote").textContent = "Preencha os dados do produto e clique em adicionar.";
    document.getElementById("submitButton").textContent = "Adicionar";
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function mostrarFormularioEdit() {
    const form = document.getElementById("product-form");
    form.classList.remove("hidden", "add-mode");
    form.classList.add("edit-mode");
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
}

function resetarFormulario() {
    limparCampos();
    document.getElementById("submitButton").textContent = "Adicionar";
    document.getElementById("formTitle").textContent = "Adicionar produto";
    document.getElementById("formNote").textContent = "Preencha os dados do produto e clique em salvar.";
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
    ocultarFormulario();
});

async function deletarProduto(id) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
        return;
    }

    try {
        const data = await apiRequest(`/produtos/${id}`, "DELETE");
        if (data.status === "erro") {
            showToast(data.mensagem || "Não foi possível excluir o produto.", "error");
            return;
        }
        showToast(data.mensagem || "Produto excluído com sucesso.", "success");
        resetarFormulario();
        ocultarFormulario();
        listarProdutos();
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        showToast("Erro ao excluir produto. Tente novamente.", "error");
    }
}
