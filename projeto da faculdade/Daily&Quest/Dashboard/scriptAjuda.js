// CONEXÃO COM O BANCO LOCAL (Para o cabeçalho)
let statusUsuario = JSON.parse(localStorage.getItem('dailyQuests_status')) || { nivel: 0, xpMaximo: 100, xp: 0, hp: 100, ouro: 0 }; 

// BANCO DE DADOS DAS PERGUNTAS (Adaptado do modelo que você enviou)
const faqData = [
    {
        pergunta: "Quais são os diferentes tipos de tarefas?",
        resposta: `<p>O Daily&Quest utiliza três tipos diferentes de tarefas para organizar sua rotina:</p>
                   <p><strong>Hábitos:</strong> Podem ser positivos ou negativos e representam algo que você gostaria de acompanhar ao longo de vários momentos do dia. Bons hábitos rendem Ouro e XP.</p>
                   <p><strong>Diárias:</strong> Tarefas que se repetem todos os dias em uma agenda estruturada. Não completá-las fará com que você perca Pontos de Vida (HP).</p>`
    },
    {
        pergunta: "Como ganho Ouro e Experiência (XP)?",
        resposta: `<p>Você ganha Ouro e XP ao marcar seus Hábitos positivos e Diárias como concluídos. Quando a barra de XP encher completamente, você subirá de nível!</p>`
    },
    {
        pergunta: "O que acontece quando fico sem Pontos de Vida?",
        resposta: `<p>Se o seu HP chegar a zero porque você deixou de cumprir suas tarefas Diárias ou fez muitos hábitos negativos, o seu personagem irá "desmaiar". Você perderá um Nível, todo o seu Ouro atual e um pedaço de equipamento. Para recuperar vida, conclua mais hábitos positivos!</p>`
    },
    {
        pergunta: "Para que serve a Loja e o Inventário?",
        resposta: `<p>O <strong>Ouro</strong> que você coleta nas tarefas pode ser gasto na <strong>Loja</strong> para comprar Equipamentos e Pets para o seu Avatar. Tudo o que você adquire vai para o seu <strong>Inventário</strong>, onde você pode organizar sua coleção.</p>`
    },
    {
        pergunta: "Posso ver dados sobre meu desempenho em tarefas e hábitos?",
        resposta: `<p>Sim! Ao acessar a aba de Tarefas, você consegue monitorar o preenchimento das suas barras de progresso diárias. A evolução do seu Avatar no cabeçalho (Nível e XP) é o maior reflexo da sua produtividade na vida real.</p>`
    }
];

//  Atualiza o cabeçalho com o status do usuário
function atualizarHeader() {
    document.getElementById('gold-text').innerText = statusUsuario.ouro;
    document.getElementById('lvl-display').innerText = `Nível ${statusUsuario.nivel}`;
    document.getElementById('hp-bar').style.width = statusUsuario.hp + '%';
    document.getElementById('hp-text').innerText = `${statusUsuario.hp} / 100`;
    
    const xpPerc = (statusUsuario.xp / statusUsuario.xpMaximo) * 100;
    document.getElementById('xp-bar').style.width = Math.min(100, xpPerc) + '%';
    document.getElementById('xp-text').innerText = `${statusUsuario.xp} / ${statusUsuario.xpMaximo}`;
}

// FUNÇÃO: Renderiza e aplica a lógica do Accordion (Sanfona)
function renderizarFAQ() {
    const container = document.getElementById('faq-container');
    container.innerHTML = '';

    faqData.forEach((item, index) => {
        const faqElement = document.createElement('div');
        faqElement.classList.add('faq-item');
        
        faqElement.innerHTML = `
            <button class="faq-question" id="pergunta-${index}">
                ${item.pergunta}
                <span class="faq-icon">▼</span>
            </button>
            <div class="faq-answer">
                ${item.resposta}
            </div>
        `;

        const btn = faqElement.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            const isActive = faqElement.classList.contains('active');
            
            
            document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));

            if (!isActive) {
                faqElement.classList.add('active');
            }
        });

        container.appendChild(faqElement);
    });
}

// Inicializa a página
window.addEventListener('DOMContentLoaded', () => {
    atualizarHeader();
    renderizarFAQ();
});