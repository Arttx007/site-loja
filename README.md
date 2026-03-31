# Site Loja

Painel frontend estático para gerenciamento de produtos da loja.

## Descrição

Esta interface web é responsável por:

- Tela de login
- Listagem de produtos
- Criação de novos produtos
- Edição de produtos existentes
- Exclusão de produtos
- Integração com a API backend (`api-loja`)

## Tecnologias

- HTML
- CSS
- JavaScript

## Estrutura do projeto

- `index.html` - página de login
- `css/style.css` - estilos visuais
- `js/auth.js` - lógica de autenticação
- `js/produto.js` - lógica de produtos
- `js/api.js` - funções de requisição à API
- `pages/produtos.html` - painel de produtos

## Como usar

1. Execute o backend em `api-loja` para que a API esteja disponível em `http://localhost:8080`.
2. Abra `site-loja/index.html` no navegador.
3. Faça login e acesse o painel de produtos.

## Requisitos

- Backend rodando em `http://localhost:8080`
- Navegador moderno (Chrome, Firefox, Edge)

## Observações

O frontend consome endpoints de `api-loja`, então é necessário que a API esteja ativa antes de usar o painel.
