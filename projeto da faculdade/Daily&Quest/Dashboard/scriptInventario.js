const statusUsuario = JSON.parse(localStorage.getItem('dailyQuests_status')) || { nivel: 0, xpMaximo: 100, xp: 0, hp: 100, ouro: 0 };
let inventario = JSON.parse(localStorage.getItem('dailyQuests_inventario')) || [];

function atualizarHeader() {
    document.getElementById('gold-text').innerText = statusUsuario.ouro;
    document.getElementById('lvl-display').innerText = `Nível ${statusUsuario.nivel}`;
    
    document.getElementById('hp-bar').style.width = statusUsuario.hp + '%';
    document.getElementById('hp-text').innerText = `${statusUsuario.hp} / 100`;
    
    const xpPerc = (statusUsuario.xp / statusUsuario.xpMaximo) * 100;
    document.getElementById('xp-bar').style.width = Math.min(100, xpPerc) + '%';
    document.getElementById('xp-text').innerText = `${statusUsuario.xp} / ${statusUsuario.xpMaximo}`;
}

function renderizarInventario() {
    const container = document.getElementById('categorias-container');
    container.innerHTML = ''; 
    
    const termoBusca = document.getElementById('inv-search').value.toLowerCase().trim();
    const checkboxesMarcados = document.querySelectorAll('.filter-group input[type="checkbox"]:checked');
    const filtrosAtivos = Array.from(checkboxesMarcados).map(cb => cb.value);
    const categoriasOrdem = ["Pets", "Peitoral", "Adereço de cabeça", "Acessório de mão", "Calças", "Botas"];

    categoriasOrdem.forEach(categoria => {
        if (filtrosAtivos.length > 0 && !filtrosAtivos.includes(categoria)) return;
        
        const itensDaCategoria = inventario.filter(item => item.categoria === categoria && item.nome.toLowerCase().includes(termoBusca));
        const section = document.createElement('div');
        
        let htmlBloco = `<div class="item-category-title">${categoria} <span class="item-badge">${itensDaCategoria.length}</span></div>`;
        
        if (itensDaCategoria.length === 0) { 
            htmlBloco += `<p class="empty-msg">Você não possui nenhum desses.</p>`; 
        } else {
            htmlBloco += `<div class="items-grid">`;
            itensDaCategoria.forEach(item => {
                htmlBloco += `
                    <div class="inv-item-card">
                        <img src="${item.img}" class="inv-item-img">
                        <p class="inv-item-name">${item.nome}</p>
                    </div>
                `;
            });
            htmlBloco += `</div>`;
        }
        
        section.innerHTML = htmlBloco;
        container.appendChild(section);
    });
}

window.onload = () => { 
    atualizarHeader(); 
    renderizarInventario(); 
};