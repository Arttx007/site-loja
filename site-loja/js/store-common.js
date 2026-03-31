const DEFAULT_PRODUCT_IMAGE =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor || 0);
}

function atualizarBadgeCarrinho() {
    const badge = document.getElementById("headerCartCount");
    if (badge) {
        badge.textContent = String(getCartCount());
    }
}

function adicionarAoCarrinhoBase(produto) {
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
    atualizarBadgeCarrinho();
}

function removerDoCarrinhoBase(produtoId) {
    saveCart(getCart().filter((item) => item.id !== produtoId));
    atualizarBadgeCarrinho();
}

function alterarQuantidadeCarrinhoBase(produtoId, delta) {
    const cart = getCart()
        .map((item) => {
            if (item.id === produtoId) {
                return { ...item, quantidade: item.quantidade + delta };
            }

            return item;
        })
        .filter((item) => item.quantidade > 0);

    saveCart(cart);
    atualizarBadgeCarrinho();
}

function renderizarAreaUsuario() {
    const avatar = document.getElementById("userAvatar");
    const nome = document.getElementById("userName");
    const email = document.getElementById("userEmail");
    const foto = getUserPhoto();
    const fotoZoom = getUserPhotoZoom();
    const fotoPosX = getUserPhotoPosX();
    const fotoPosY = getUserPhotoPosY();

    if (avatar) {
        if (foto) {
            avatar.innerHTML = `<img src="${foto}" alt="${getUserName()}" style="transform: scale(${fotoZoom}); object-position: ${fotoPosX}% ${fotoPosY}%;">`;
            avatar.classList.add("has-photo");
        } else {
            avatar.textContent = getUserInitials();
            avatar.classList.remove("has-photo");
        }
    }

    if (nome) {
        nome.textContent = getUserName();
    }

    if (email) {
        email.textContent = getUserEmail();
    }
}

function toggleUserMenu() {
    const menu = document.getElementById("userDropdown");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}

function fecharMenuUsuarioSeNecessario(event) {
    const menu = document.getElementById("userDropdown");
    const botao = document.getElementById("userMenuButton");

    if (!menu || !botao) {
        return;
    }

    if (!menu.contains(event.target) && !botao.contains(event.target)) {
        menu.classList.add("hidden");
    }
}

function abrirCarrinho() {
    window.location.href = "./carrinho.html";
}

function abrirConfiguracoes() {
    window.location.href = "./configuracoes.html";
}

function inicializarCabecalhoLoja() {
    renderizarAreaUsuario();
    atualizarBadgeCarrinho();
    document.addEventListener("click", fecharMenuUsuarioSeNecessario);
}
