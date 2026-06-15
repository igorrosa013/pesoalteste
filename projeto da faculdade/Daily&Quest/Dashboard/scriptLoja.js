// CONEXÃO COM O BANCO LOCAL (Status e Inventário)
let statusUsuario = JSON.parse(localStorage.getItem('dailyQuests_status')) || { nivel: 0, xpMaximo: 100, xp: 0, hp: 100, ouro: 500 }; 
let inventario = JSON.parse(localStorage.getItem('dailyQuests_inventario')) || [];

// BANCO DE DADOS DA LOJA (Atualizado com os arquivos reais do projeto)
const catalogoLoja = [
    { id: 101, nome: "Asas", categoria: "Peitoral", img: "../Imgs/asa-64.png", preco: 500 },
    { id: 102, nome: "Canguru", categoria: "Pets", img: "../Imgs/canguru-64.png", preco: 300 },
    { id: 103, nome: "Capacete Blindado", categoria: "Adereço de cabeça", img: "../Imgs/capacete-blindado-64.png", preco: 250 },
    { id: 104, nome: "Capacete Grego", categoria: "Adereço de cabeça", img: "../Imgs/capacete-grego-64.png", preco: 200 },
    { id: 105, nome: "Colar", categoria: "Peitoral", img: "../Imgs/colar-100.png", preco: 150 },
    { id: 106, nome: "Chinelos", categoria: "Botas", img: "../Imgs/flip-flops-64.png", preco: 50 },
    { id: 107, nome: "Armadura de Ferro", categoria: "Peitoral", img: "../Imgs/homem-de-ferro-64.png", preco: 1000 },
    { id: 108, nome: "Mochila", categoria: "Peitoral", img: "../Imgs/mochila-64.png", preco: 120 },
    { id: 109, nome: "Cachecol", categoria: "Peitoral", img: "../Imgs/scarf-64.png", preco: 80 },
    { id: 110, nome: "Escudo", categoria: "Acessório de mão", img: "../Imgs/shield-64.png", preco: 400 },
    { id: 111, nome: "Capacete Viking", categoria: "Adereço de cabeça", img: "../Imgs/viking-helmet-64.png", preco: 300 }
];

let itemSendoComprado = null;

// FUNÇÃO: Atualiza o cabeçalho com o ouro e status atual
function atualizarHeader() {
    document.getElementById('gold-text').innerText = statusUsuario.ouro;
    document.getElementById('lvl-display').innerText = `Nível ${statusUsuario.nivel}`;
    document.getElementById('hp-bar').style.width = statusUsuario.hp + '%';
    document.getElementById('hp-text').innerText = `${statusUsuario.hp} / 100`;
    
    const xpPerc = (statusUsuario.xp / statusUsuario.xpMaximo) * 100;
    document.getElementById('xp-bar').style.width = Math.min(100, xpPerc) + '%';
    document.getElementById('xp-text').innerText = `${statusUsuario.xp} / ${statusUsuario.xpMaximo}`;
}

// FUNÇÃO: Renderiza a grade de itens à venda
function renderizarLoja() {
    const container = document.getElementById('categorias-container');
    container.innerHTML = ''; 
    
    const termoBusca = document.getElementById('loja-search').value.toLowerCase().trim();
    const checkboxesMarcados = document.querySelectorAll('.filter-group input[type="checkbox"]:checked');
    const filtrosAtivos = Array.from(checkboxesMarcados).map(cb => cb.value);
    const categoriasOrdem = ["Pets", "Peitoral", "Adereço de cabeça", "Acessório de mão", "Calças", "Botas"];

    categoriasOrdem.forEach(categoria => {
        if (filtrosAtivos.length > 0 && !filtrosAtivos.includes(categoria)) return;
        
        const itensDaCategoria = catalogoLoja.filter(item => item.categoria === categoria && item.nome.toLowerCase().includes(termoBusca));
        if (itensDaCategoria.length === 0) return; // Oculta a seção se não houver itens

        const section = document.createElement('div');
        let htmlBloco = `<div class="item-category-title">${categoria} <span class="item-badge">${itensDaCategoria.length}</span></div>`;
        htmlBloco += `<div class="items-grid">`;

        itensDaCategoria.forEach(item => {
            // Regras IHC: Feedback Informativo
            const jaAdquirido = inventario.some(inv => inv.id === item.id);
            const ouroInsuficiente = statusUsuario.ouro < item.preco;
            
            let btnTexto = "Comprar";
            let btnStatus = "";
            let cardClass = "";

            if (jaAdquirido) {
                btnTexto = "Adquirido";
                btnStatus = "disabled";
                cardClass = "adquirido";
            } else if (ouroInsuficiente) {
                btnTexto = "Ouro Insuficiente";
                btnStatus = "disabled";
            }

            htmlBloco += `
                <div class="inv-item-card ${cardClass}">
                    <img src="${item.img}" class="inv-item-img" alt="${item.nome}">
                    <p class="inv-item-name">${item.nome}</p>
                    <p class="loja-item-price"><img src="../Imgs/barras-de-ouro.png" alt="Ouro"> ${item.preco}</p>
                    <button class="btn-comprar" ${btnStatus} onclick="abrirModalCompra(${item.id})">${btnTexto}</button>
                </div>
            `;
        });
        
        htmlBloco += `</div>`;
        section.innerHTML = htmlBloco;
        container.appendChild(section);
    });
}

// IHC: Reversão de Ações (Abre o modal antes de efetivar a compra)
function abrirModalCompra(id) {
    itemSendoComprado = catalogoLoja.find(i => i.id === id);
    document.getElementById('texto-confirmacao').innerText = `Deseja adquirir '${itemSendoComprado.nome}'?`;
    document.getElementById('detalhe-confirmacao').innerText = `Isso custará ${itemSendoComprado.preco} de Ouro.`;
    
    document.getElementById('modal-compra').classList.add('show');
}

function fecharModalCompra() {
    document.getElementById('modal-compra').classList.remove('show');
    itemSendoComprado = null;
}

// IHC: Efetiva a Compra e integra com a Notificação Global
function efetivarCompra() {
    if (itemSendoComprado && statusUsuario.ouro >= itemSendoComprado.preco) {
        
        // 1. Subtrai o ouro
        statusUsuario.ouro -= itemSendoComprado.preco;
        localStorage.setItem('dailyQuests_status', JSON.stringify(statusUsuario));
        
        // 2. Adiciona o item ao inventário
        inventario.push(itemSendoComprado);
        localStorage.setItem('dailyQuests_inventario', JSON.stringify(inventario));
        
        // 3. Dispara a notificação visual (integrado com globalUI.js)
        if(typeof registrarNotificacao === 'function') {
            registrarNotificacao(`Você comprou '${itemSendoComprado.nome}' com sucesso!`);
        }
        
        // 4. Atualiza a tela e fecha o modal
        fecharModalCompra();
        atualizarHeader();
        renderizarLoja();
    }
}

// Inicializa a tela ao carregar
window.addEventListener('DOMContentLoaded', () => { 
    atualizarHeader(); 
    renderizarLoja(); 
});