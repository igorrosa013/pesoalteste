let listaTarefas = JSON.parse(localStorage.getItem('dailyQuests_tarefas')) || [];
let statusBruto = JSON.parse(localStorage.getItem('dailyQuests_status')) || {};

if (typeof statusBruto.nivel === 'undefined') statusBruto.nivel = 0;
if (typeof statusBruto.xpMaximo === 'undefined') statusBruto.xpMaximo = 100;
if (typeof statusBruto.xp === 'undefined') statusBruto.xp = 0;
if (typeof statusBruto.hp === 'undefined') statusBruto.hp = 100;
if (typeof statusBruto.ouro === 'undefined') statusBruto.ouro = 0;

let statusUsuario = statusBruto;
let inventario = JSON.parse(localStorage.getItem('dailyQuests_inventario')) || [];
let tarefaEmEdicaoId = null;

function mostrarNotificacaoRecompensa(xpGanha, ouroGanho) {
    const container = document.getElementById('toast-container');
    
    const toastOuro = document.createElement('div');
    toastOuro.className = 'toast-reward';
    toastOuro.innerHTML = `Você ganhou Ouro <img src="../Imgs/barras-de-ouro.png" alt="Moeda"> + ${ouroGanho}`;
    container.appendChild(toastOuro);
    
    const toastXP = document.createElement('div');
    toastXP.className = 'toast-reward';
    toastXP.innerHTML = `Você ganhou Experiência <img src="../Imgs/trofeu.png" alt="XP"> + ${xpGanha}`;
    container.appendChild(toastXP);
    
    const toastHP = document.createElement('div');
    toastHP.className = 'toast-reward';
    toastHP.innerHTML = `Você recuperou Vida <img src="../Imgs/Life.png" alt="HP"> + 3`;
    container.appendChild(toastHP);
    
    setTimeout(() => { 
        toastOuro.classList.add('show'); 
        toastXP.classList.add('show'); 
        toastHP.classList.add('show'); 
    }, 100);
    
    setTimeout(() => {
        toastOuro.classList.remove('show'); 
        toastXP.classList.remove('show'); 
        toastHP.classList.remove('show');
        setTimeout(() => { 
            toastOuro.remove(); 
            toastXP.remove(); 
            toastHP.remove(); 
        }, 300);
    }, 3000);
}

function comprarItem(nome, preco, categoria, imgUrl) {
    if (statusUsuario.ouro < preco) {
        alert(`Ouro insuficiente! Você precisa de ${preco} barras de ouro.`);
        return;
    }
    
    if (inventario.find(i => i.nome === nome)) {
        alert("Você já possui este item no inventário!");
        return;
    }
    
    statusUsuario.ouro -= preco;
    inventario.push({ nome: nome, categoria: categoria, img: imgUrl, data: Date.now() });
    
    localStorage.setItem('dailyQuests_status', JSON.stringify(statusUsuario));
    localStorage.setItem('dailyQuests_inventario', JSON.stringify(inventario));
    
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div'); 
    toast.className = 'toast-reward'; 
    toast.innerHTML = `Item comprado: ${nome}! 🎒`; 
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => { 
        toast.classList.remove('show'); 
        setTimeout(() => toast.remove(), 300); 
    }, 3000);
    
    /* Disparo da Notificação Global */
    if (typeof registrarNotificacao === 'function') {
        registrarNotificacao(`Você comprou o item: ${nome} 🎒`);
    }
   
    
    atualizarUIStatusGlobais();
}

function mostrarNotificacaoDano(hpPerdido, xpPerdido) {
    const container = document.getElementById('toast-container');
    
    const toastHP = document.createElement('div');
    toastHP.className = 'toast-damage';
    toastHP.innerHTML = `Você perdeu Vida <img src="../Imgs/Life.png" alt="HP"> - ${hpPerdido}`;
    container.appendChild(toastHP);
    
    const toastXP = document.createElement('div');
    toastXP.className = 'toast-damage';
    toastXP.innerHTML = `Você perdeu Experiência <img src="../Imgs/trofeu.png" alt="XP"> - ${xpPerdido}`;
    container.appendChild(toastXP);
    
    setTimeout(() => { 
        toastHP.classList.add('show'); 
        toastXP.classList.add('show'); 
    }, 100);
    
    setTimeout(() => {
        toastHP.classList.remove('show'); 
        toastXP.classList.remove('show');
        setTimeout(() => { 
            toastHP.remove(); 
            toastXP.remove(); 
        }, 300);
    }, 3000);
}

function mostrarNotificacaoLevelUp(nivel) {
    const container = document.getElementById('toast-container');
    const toastLvl = document.createElement('div');
    toastLvl.className = 'toast-levelup';
    toastLvl.innerHTML = `🎉 PARABÉNS! Você subiu para o Lvl ${nivel}!`;
    container.appendChild(toastLvl);
    
    setTimeout(() => { 
        toastLvl.classList.add('show'); 
    }, 100);
    
    setTimeout(() => {
        toastLvl.classList.remove('show');
        setTimeout(() => { 
            toastLvl.remove(); 
        }, 300);
    }, 4000);

    /* Disparo da Notificação Global */
    if (typeof registrarNotificacao === 'function') {
        registrarNotificacao(`🎉 Parabéns! Você alcançou o Nível ${nivel}! Continue assim!`);
    }
    
}

function atualizarUIStatusGlobais() {
    const porcentagemXP = (statusUsuario.xp / statusUsuario.xpMaximo) * 100;
    const xpVisivelPercent = Math.max(0, Math.min(100, porcentagemXP));
    
    document.getElementById('nav-gold-text').innerText = statusUsuario.ouro;
    document.getElementById('xp-bar').style.width = `${xpVisivelPercent}%`;
    document.getElementById('xp-text').innerText = `${statusUsuario.xp} / ${statusUsuario.xpMaximo}`;
    
    const levelDisplay = document.getElementById('user-level-display');
    if (levelDisplay) { 
        // O nome do avatar agora é puxado via globalUI.js na tag h2, então deixamos aqui só o Nível
        levelDisplay.innerText = ` Nível ${statusUsuario.nivel} `; 
    }
    
    document.getElementById('hp-bar').style.width = `${statusUsuario.hp}%`;
    document.getElementById('hp-text').innerText = `${statusUsuario.hp} / 100`;
}

function adicionarXP_TDD(status, quantidade) {
    status.xp += quantidade;
    let subiuDeNivel = false;
    
    while (status.xp >= status.xpMaximo) {
        status.xp -= status.xpMaximo; 
        status.nivel += 1;
        status.xpMaximo = Math.round(status.xpMaximo * 1.10); 
        status.hp = 100; 
        subiuDeNivel = true;
    }
    
    if (subiuDeNivel) {
        mostrarNotificacaoLevelUp(status.nivel);
    }
}

function removerXP_TDD(status, quantidade) { 
    status.xp = Math.max(0, status.xp - quantidade); 
}

function completarTarefaLogica(tarefaId) {
    const tarefa = listaTarefas.find(t => String(t.id) === String(tarefaId));
    if (!tarefa) return;
    
    tarefa.contPositivo = (tarefa.contPositivo || 0) + 1;
    
    const recompensas = { 
        'Hábito': { xp: 20, ouro: 10 }, 
        'Diária': { xp: 20, ouro: 10 }, 
        'Desafio': { xp: 40, ouro: 15 } 
    };
    
    const ganho = recompensas[tarefa.tipo] || { xp: 0, ouro: 0 };
    
    statusUsuario.hp = Math.min(100, statusUsuario.hp + 3); 
    adicionarXP_TDD(statusUsuario, ganho.xp);
    statusUsuario.ouro += ganho.ouro;
    
    localStorage.setItem('dailyQuests_tarefas', JSON.stringify(listaTarefas));
    localStorage.setItem('dailyQuests_status', JSON.stringify(statusUsuario));
    
    mostrarNotificacaoRecompensa(ganho.xp, ganho.ouro);
    atualizarUIStatusGlobais(); 
    renderizarTarefas();
}

function penalizarTarefaLogica(tarefaId) {
    const tarefa = listaTarefas.find(t => String(t.id) === String(tarefaId));
    if (!tarefa) return;
    
    tarefa.contNegativo = (tarefa.contNegativo || 0) + 1;
    
    const penalidades = { 
        'Hábito': { hp: 5, xp: 10 }, 
        'Diária': { hp: 5, xp: 10 }, 
        'Desafio': { hp: 10, xp: 20 } 
    };
    
    const dano = penalidades[tarefa.tipo] || { hp: 0, xp: 0 };
    
    statusUsuario.hp = Math.max(0, statusUsuario.hp - dano.hp);
    removerXP_TDD(statusUsuario, dano.xp);
    
    localStorage.setItem('dailyQuests_tarefas', JSON.stringify(listaTarefas));
    localStorage.setItem('dailyQuests_status', JSON.stringify(statusUsuario));
    
    mostrarNotificacaoDano(dano.hp, dano.xp);
    atualizarUIStatusGlobais(); 
    renderizarTarefas();
}

function toggleMenuTarefa(id, event) {
    event.stopPropagation();
    
    document.querySelectorAll('.task-menu-dropdown').forEach(m => { 
        if (m.id !== `menu-${id}`) {
            m.classList.remove('show'); 
        }
    });
    
    const menu = document.getElementById(`menu-${id}`);
    if (menu) {
        menu.classList.toggle('show');
    }
}

document.addEventListener('click', () => { 
    document.querySelectorAll('.task-menu-dropdown').forEach(m => m.classList.remove('show')); 
});

function deletarTarefa(id, event) {
    event.stopPropagation();
    
    listaTarefas = listaTarefas.filter(t => String(t.id) !== String(id));
    localStorage.setItem('dailyQuests_tarefas', JSON.stringify(listaTarefas));
    
    renderizarTarefas();
}

function abrirEditarTarefa(id, event) {
    event.stopPropagation();
    
    const tarefa = listaTarefas.find(t => String(t.id) === String(id));
    if (!tarefa) return;
    
    tarefaEmEdicaoId = id; 
    
    document.getElementById('modal-title').innerText = `Editar ${tarefa.tipo}`;
    document.getElementById('modal-tipo-tarefa').value = tarefa.tipo;
    document.getElementById('modal-input-titulo').value = tarefa.titulo;
    document.getElementById('modal-input-reset').value = tarefa.reset;
    document.getElementById('btn-criar-topo').innerText = 'Salvar';
    document.getElementById('btn-criar-baixo').innerText = 'Salvar';
    
    document.querySelectorAll('.task-menu-dropdown').forEach(m => m.classList.remove('show'));
    document.getElementById('modal-tarefa').classList.add('show');
}

const btnNovaTarefa = document.getElementById('btn-nova-tarefa');
const dropdownTarefa = document.getElementById('dropdown-tarefa');
const modalTarefa = document.getElementById('modal-tarefa');

function abrirModal(tipo) { 
    document.getElementById('modal-title').innerText = `Criar ${tipo}`; 
    document.getElementById('modal-tipo-tarefa').value = tipo; 
    dropdownTarefa.classList.remove('show'); 
    modalTarefa.classList.add('show'); 
    document.getElementById('modal-input-titulo').focus(); 
}

function fecharModal() { 
    modalTarefa.classList.remove('show'); 
    document.getElementById('modal-input-titulo').value = ''; 
    document.getElementById('modal-input-obs').value = ''; 
    tarefaEmEdicaoId = null; 
    document.getElementById('btn-criar-topo').innerText = 'Criar'; 
    document.getElementById('btn-criar-baixo').innerText = 'Criar'; 
}

btnNovaTarefa.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    dropdownTarefa.classList.toggle('show'); 
});

document.addEventListener('click', () => dropdownTarefa.classList.remove('show'));

document.getElementById('opt-habito').addEventListener('click', () => abrirModal('Hábito'));
document.getElementById('opt-diaria').addEventListener('click', () => abrirModal('Diária'));
document.getElementById('opt-desafio').addEventListener('click', () => abrirModal('Desafio'));

document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);
modalTarefa.addEventListener('click', (e) => { 
    if (e.target === modalTarefa) fecharModal(); 
});

const btnPos = document.getElementById('btn-toggle-pos');
const btnNeg = document.getElementById('btn-toggle-neg');

btnPos.addEventListener('click', () => btnPos.classList.toggle('active'));
btnNeg.addEventListener('click', () => btnNeg.classList.toggle('active'));

function filtrarTarefasPorColuna(tarefas, coluna) {
    if (coluna === 'habitos') return tarefas.filter(t => t.tipo === 'Hábito');
    if (coluna === 'diarias') return tarefas.filter(t => t.tipo === 'Diária');
    if (coluna === 'desafios') return tarefas.filter(t => t.tipo === 'Desafio');
    return [];
}

function criarCardHTML(tarefa) {
    const div = document.createElement('div'); 
    div.className = 'task-card';
    
    div.innerHTML = `
        <button class="task-action-btn btn-plus" onclick="completarTarefaLogica('${tarefa.id}')">+</button>
        <div class="task-content">
            <div class="task-title">${tarefa.titulo}</div>
            <div class="task-meta">${tarefa.tipo} • ${tarefa.reset}</div>
            <div class="task-options" onclick="toggleMenuTarefa('${tarefa.id}', event)">⋮
                <div id="menu-${tarefa.id}" class="task-menu-dropdown">
                    <div class="task-menu-item" onclick="abrirEditarTarefa('${tarefa.id}', event)">Editar tarefa</div>
                    <div class="task-menu-item delete" onclick="deletarTarefa('${tarefa.id}', event)">Deletar tarefa</div>
                </div>
            </div>
            <div class="task-counter">${tarefa.contPositivo || 0} | ${tarefa.contNegativo || 0}</div>
        </div>
        <button class="task-action-btn btn-minus" onclick="penalizarTarefaLogica('${tarefa.id}')">-</button>
    `;
    
    return div;
}

function renderizarTarefas() {
    const mapColunas = { 
        'lista-habitos': filtrarTarefasPorColuna(listaTarefas, 'habitos'), 
        'lista-diarias': filtrarTarefasPorColuna(listaTarefas, 'diarias'), 
        'lista-desafios': filtrarTarefasPorColuna(listaTarefas, 'desafios') 
    };
    
    for (const idColuna in mapColunas) {
        const container = document.getElementById(idColuna);
        if (container) { 
            container.innerHTML = ''; 
            mapColunas[idColuna].forEach(tarefa => { 
                container.appendChild(criarCardHTML(tarefa)); 
            }); 
        }
    }
    
    document.getElementById('count-habitos').innerText = mapColunas['lista-habitos'].length;
    document.getElementById('count-diarias').innerText = mapColunas['lista-diarias'].length;
    document.getElementById('count-desafios').innerText = mapColunas['lista-desafios'].length;
    
    filtrarItensDaColuna('lista-habitos', document.getElementById('input-busca-habitos').value || '');
    filtrarItensDaColuna('lista-diarias', document.getElementById('input-busca-diarias').value || '');
    filtrarItensDaColuna('lista-desafios', document.getElementById('input-busca-desafios').value || '');
}

function salvarNovaTarefa() {
    const titulo = document.getElementById('modal-input-titulo').value.trim();
    const tipo = document.getElementById('modal-tipo-tarefa').value;
    const reset = document.getElementById('modal-input-reset').value;
    
    if (!titulo) { 
        alert("O Título é obrigatório."); 
        return; 
    }
    
    if (tarefaEmEdicaoId) {
        const index = listaTarefas.findIndex(t => String(t.id) === String(tarefaEmEdicaoId));
        if (index !== -1) { 
            listaTarefas[index].titulo = titulo; 
            listaTarefas[index].tipo = tipo; 
            listaTarefas[index].reset = reset; 
        }
    } else { 
        const novaTarefa = { 
            id: Date.now(), 
            titulo: titulo, 
            tipo: tipo, 
            reset: reset, 
            contPositivo: 0, 
            contNegativo: 0 
        }; 
        listaTarefas.push(novaTarefa); 
    }
    
    localStorage.setItem('dailyQuests_tarefas', JSON.stringify(listaTarefas));
    
    fecharModal(); 
    renderizarTarefas();
}

function filtrarItensDaColuna(containerId, termoBusca) {
    const container = document.getElementById(containerId); 
    if (!container) return;
    
    const itens = container.children; 
    const termo = termoBusca.toLowerCase().trim();
    
    for (let i = 0; i < itens.length; i++) {
        const item = itens[i]; 
        let textoParaBusca = "";
        
        if (item.classList.contains('task-card')) { 
            const tituloEl = item.querySelector('.task-title'); 
            if (tituloEl) {
                textoParaBusca = tituloEl.innerText.toLowerCase(); 
            }
        } else if (item.classList.contains('reward-card')) { 
            const nomeEl = item.querySelector('.reward-name'); 
            if (nomeEl) {
                textoParaBusca = nomeEl.innerText.toLowerCase(); 
            }
        }
        
        if (textoParaBusca.includes(termo)) {
            item.style.display = ""; 
        } else {
            item.style.display = "none"; 
        }
    }
}

document.getElementById('btn-criar-topo').addEventListener('click', salvarNovaTarefa);
document.getElementById('btn-criar-baixo').addEventListener('click', salvarNovaTarefa);

window.onload = () => {
    const nivelOriginal = statusUsuario.nivel;
    adicionarXP_TDD(statusUsuario, 0); 
    
    if (statusUsuario.nivel > nivelOriginal) {
        localStorage.setItem('dailyQuests_status', JSON.stringify(statusUsuario));
    }
    
    atualizarUIStatusGlobais(); 
    renderizarTarefas();
};