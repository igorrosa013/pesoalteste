
// VARIÁVEIS GLOBAIS DE DADOS
let notificacoesGerais = JSON.parse(localStorage.getItem('dq_notificacoes')) || [];

// Simulação da busca de dados do Login (chave padrão 'usuarioLogado' salva na tela de login)
let dadosLogin = JSON.parse(localStorage.getItem('usuarioLogado'));

// Cria o perfil do usuário garantindo que puxe os dados do Login se existirem
let perfilUsuario = JSON.parse(localStorage.getItem('dq_perfil')) || { 
    nomeAvatar: 'Igor Silva', 
    nome: '', 
    sobrenome: '', 
    email: '', 
    idade: '' 
};

// Sincronização inicial: Se o usuário acabou de logar e não tem perfil salvo ainda, puxa os dados do login
if (dadosLogin && !localStorage.getItem('dq_perfil')) {
    perfilUsuario.nome = dadosLogin.nome || '';
    perfilUsuario.sobrenome = dadosLogin.sobrenome || '';
    perfilUsuario.email = dadosLogin.email || '';
    perfilUsuario.idade = dadosLogin.idade || '';
    perfilUsuario.nomeAvatar = dadosLogin.nome ? `${dadosLogin.nome} ${dadosLogin.sobrenome}`.trim() : 'Igor Silva';
    
    // Salva para não sobrescrever futuras edições manuais
    localStorage.setItem('dq_perfil', JSON.stringify(perfilUsuario));
}


// SISTEMA DE NOTIFICAÇÕES

function registrarNotificacao(texto) {
    const novaNotificacao = {
        id: Date.now(),
        texto: texto,
        lida: false,
        data: new Date().toLocaleString('pt-BR')
    };
    notificacoesGerais.unshift(novaNotificacao);
    localStorage.setItem('dq_notificacoes', JSON.stringify(notificacoesGerais));
    atualizarBadgeNotificacao();
    renderizarNotificacoes();
}

function renderizarNotificacoes() {
    const lista = document.getElementById('lista-notificacoes');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    if (notificacoesGerais.length === 0) {
        lista.innerHTML = '<div class="notif-empty">Nenhuma notificação no momento.</div>';
        return;
    }

    notificacoesGerais.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notif-item ${notif.lida ? 'lida' : ''}`;
        item.innerHTML = `
            <span>${notif.texto}</span>
            <span class="notif-date">${notif.data}</span>
        `;
        lista.appendChild(item);
    });
}

function marcarNotificacoesLidas() {
    notificacoesGerais.forEach(notif => notif.lida = true);
    localStorage.setItem('dq_notificacoes', JSON.stringify(notificacoesGerais));
    atualizarBadgeNotificacao();
    renderizarNotificacoes();
}

function limparNotificacoes() {
    notificacoesGerais = [];
    localStorage.setItem('dq_notificacoes', JSON.stringify(notificacoesGerais));
    atualizarBadgeNotificacao();
    renderizarNotificacoes();
}

function atualizarBadgeNotificacao() {
    const badge = document.getElementById('badge-notificacao');
    if (!badge) return;
    const temNaoLida = notificacoesGerais.some(n => !n.lida);
    badge.style.display = temNaoLida ? 'block' : 'none';
}


// SISTEMA DE PERFIL E LOGOUT

function abrirModalPerfil() {
    const statusAtual = JSON.parse(localStorage.getItem('dailyQuests_status')) || { nivel: 0, xp: 0, hp: 100, ouro: 0 };
    
    document.getElementById('prof-lvl').innerText = statusAtual.nivel;
    document.getElementById('prof-gold').innerText = statusAtual.ouro;
    document.getElementById('prof-hp').innerText = statusAtual.hp;
    document.getElementById('prof-xp').innerText = statusAtual.xp;

    document.getElementById('prof-avatar-name').value = perfilUsuario.nomeAvatar;
    document.getElementById('prof-nome').value = perfilUsuario.nome;
    document.getElementById('prof-sobrenome').value = perfilUsuario.sobrenome;
    document.getElementById('prof-email').value = perfilUsuario.email;
    document.getElementById('prof-idade').value = perfilUsuario.idade;

    document.getElementById('dropdown-usuario-menu').classList.remove('show');
    document.getElementById('modal-perfil').classList.add('show');
}

function fecharModalPerfil() {
    document.getElementById('modal-perfil').classList.remove('show');
}

function salvarPerfil() {
    perfilUsuario.nomeAvatar = document.getElementById('prof-avatar-name').value;
    perfilUsuario.nome = document.getElementById('prof-nome').value;
    perfilUsuario.sobrenome = document.getElementById('prof-sobrenome').value;
    perfilUsuario.email = document.getElementById('prof-email').value;
    perfilUsuario.idade = document.getElementById('prof-idade').value;

    localStorage.setItem('dq_perfil', JSON.stringify(perfilUsuario));
    
    aplicarNomeAvatar();
    fecharModalPerfil();
}

function aplicarNomeAvatar() {
    const displayHome = document.getElementById('user-name-display');
    if (displayHome) {
        displayHome.innerText = perfilUsuario.nomeAvatar;
    }
}

function deslogar() {
    window.location.href = '../login/Login.html';
}


// INICIALIZAÇÃO DE EVENTOS GLOBAIS

document.addEventListener('DOMContentLoaded', () => {
    aplicarNomeAvatar();
    atualizarBadgeNotificacao();
    renderizarNotificacoes();

    const btnNotif = document.getElementById('btn-notificacoes');
    const menuNotif = document.getElementById('dropdown-notificacoes');
    
    const btnUser = document.getElementById('btn-usuario');
    const menuUser = document.getElementById('dropdown-usuario-menu');

    if (btnNotif) {
        btnNotif.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menuUser) menuUser.classList.remove('show'); 
            menuNotif.classList.toggle('show');
        });
    }

    if (btnUser) {
        btnUser.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menuNotif) menuNotif.classList.remove('show'); 
            menuUser.classList.toggle('show');
        });
    }

    document.addEventListener('click', () => {
        if (menuNotif) menuNotif.classList.remove('show');
        if (menuUser) menuUser.classList.remove('show');
    });
    
    if (menuNotif) menuNotif.addEventListener('click', (e) => e.stopPropagation());
    if (menuUser) menuUser.addEventListener('click', (e) => e.stopPropagation());
});