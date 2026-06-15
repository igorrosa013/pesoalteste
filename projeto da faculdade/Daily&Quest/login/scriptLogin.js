const usersDatabase = loadUsersFromStorage();

function loadUsersFromStorage() {
    const storedUsers = localStorage.getItem('dailyQuestUsers');
    if (!storedUsers) return [];

    try {
        const parsedUsers = JSON.parse(storedUsers);
        return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch (error) {
        console.warn('Falha ao carregar usuários do localStorage:', error);
        return [];
    }
}

function saveUsersToStorage() {
    localStorage.setItem('dailyQuestUsers', JSON.stringify(usersDatabase));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
        toast.className = 'toast';
    }, 3600);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getUserByEmail(email) {
    return usersDatabase.find(user => user.email.toLowerCase() === email.toLowerCase());
}

function switchForm(formName) {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const forgotSection = document.getElementById('forgot-section');

    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    if (forgotSection) {
        forgotSection.classList.add('hidden');
    }

    if (formName === 'register') {
        registerSection.classList.remove('hidden');
    } else if (formName === 'forgot') {
        if (forgotSection) {
            forgotSection.classList.remove('hidden');
        }
    } else {
        loginSection.classList.remove('hidden');
    }
}

function togglePasswordVisibility(inputId) {
    const inputElement = document.getElementById(inputId);
    
    if (inputElement.type === 'password') {
        inputElement.type = 'text';
    } else {
        inputElement.type = 'password';
    }
}

function formatDateInput(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
}

function validateDateInput(input) {
    const value = input.value;
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return false;
    const day = Number(match);
    const month = Number(match);
    const year = Number(match);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

document.addEventListener('DOMContentLoaded', function() {
    const nascimentoInput = document.getElementById('reg-nascimento');
    if (nascimentoInput) {
        nascimentoInput.addEventListener('input', function() {
            this.value = formatDateInput(this.value);
            this.setCustomValidity('');
        });

        nascimentoInput.addEventListener('blur', function() {
            if (this.value && !validateDateInput(this)) {
                this.setCustomValidity('Data inválida - use dd/mm/aaaa');
            } else {
                this.setCustomValidity('');
            }
        });
    }
});

function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById('reg-nome').value.trim();
    const surname = document.getElementById('reg-sobrenome').value.trim();
    const birthDateInput = document.getElementById('reg-nascimento');
    const birthDate = birthDateInput.value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-senha').value;

    if (!name || !surname || !birthDate || !email || !password) {
        showToast('Preencha todos os campos para criar a conta.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('E-mail inválido. ', 'error');
        return;
    }

    if (!validateDateInput(birthDateInput)) {
        showToast('Data de nascimento inválida. Use dd/mm/aaaa.', 'error');
        return;
    }

    if (getUserByEmail(email)) {
        showToast('Este e-mail já está cadastrado.', 'error');
        return;
    }

    usersDatabase.push({
        name,
        surname,
        birthDate,
        email,
        password,
    });
    saveUsersToStorage();
    showToast('Cadastro realizado com sucesso!', 'success');

    document.getElementById('reg-nome').value = '';
    document.getElementById('reg-sobrenome').value = '';
    birthDateInput.value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-senha').value = '';

    setTimeout(() => {
        switchForm('login');
        document.getElementById('login-email').value = email;
        document.getElementById('login-senha').focus();
    }, 300);
}

function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-senha').value;

    if (!email || !password) {
        showToast('Preencha e-mail e senha para entrar.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('E-mail inválido. Verifique o formato antes de entrar.', 'error');
        return;
    }

    const user = getUserByEmail(email);
    if (!user) {
        showToast('E-mail não encontrado. Cadastre-se primeiro.', 'error');
        return;
    }

    if (user.password !== password) {
        showToast('Senha incorreta. ', 'error');
        return;
    }

    showToast('Login realizado com sucesso!', 'success');
    
    // Salva o usuário na sessão para que o Dashboard consiga puxar os dados do perfil
    localStorage.setItem('usuarioLogado', JSON.stringify(user));
    
    // Aguarda 1 segundo e redireciona para a Homepage
    setTimeout(() => {
        window.location.href = '../Dashboard/Homepage.html';
    }, 1000);
}

function handleAuth(event, type) {
    if (type === 'login') {
        loginUser(event);
    } else {
        registerUser(event);
    }
}   