// ===== Elementos da página que o script usa =====
const form = document.getElementById("formAluno");
const contador = document.getElementById("contador");
const painel = document.getElementById("tabelaAlunos");
const filtroCurso = document.getElementById("filtroCurso");
const caixaMensagem = document.getElementById("caixaMensagem");

let temporizador; // guarda o "despertador" que apaga a mensagem
let todosAlunos = []; // guarda a lista completa de alunos vinda do servidor

// Cria uma linha do card: um rótulo em negrito + o valor como texto puro
function criarLinha(rotulo, valor, classe) {
    const linha = document.createElement("p");

    if (classe) {
        linha.className = classe;
    }

    const negrito = document.createElement("strong");
    negrito.textContent = rotulo;

    linha.appendChild(negrito);
    linha.append(" " + valor);

    return linha;
}

// Mostra uma mensagem (tipo: "sucesso" ou "erro") e a apaga depois de 4 segundos
function mostrarMensagem(texto, tipo) {
    caixaMensagem.textContent = texto;
    caixaMensagem.className = "mensagem " + tipo;

    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
        caixaMensagem.textContent = "";
        caixaMensagem.className = "";
    }, 4000);
}

// ===== Envio do formulário =====
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const idade = document.getElementById("idade").value;
    const email = document.getElementById("email").value;
    const curso = document.getElementById("curso").value;

    try {
        // Envia os dados em JSON para o servidor
        const resposta = await fetch("/alunos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome,
                idade: idade,
                email: email,
                curso: curso
            })
        });

        const dados = await resposta.json();

        // Se o servidor respondeu com erro, avisa e para (não limpa o formulário)
        if (!resposta.ok) {
            mostrarMensagem(dados.mensagem, "erro");
            return;
        }

        // Deu tudo certo: avisa, atualiza a lista e limpa o formulário
        mostrarMensagem(dados.mensagem, "sucesso");
        await carregarAlunos();
        form.reset();
    } catch (erro) {
        mostrarMensagem("Não foi possível conectar ao servidor. Verifique se ele está ligado.", "erro");
    }
});

// ===== Desenha na tela a lista de alunos que receber =====
function mostrarAlunos(lista) {
    painel.textContent = "";
    contador.textContent = `Total de alunos: ${lista.length}`;

    // Lista vazia: mostra uma mensagem e para
    if (lista.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = "Nenhum aluno encontrado.";
        vazio.style.cssText = "color: #888; text-align: center; font-size: 14px;";
        painel.appendChild(vazio);
        return;
    }

    // Para cada aluno da lista, monta um card
    lista.forEach(function (aluno) {
        const card = document.createElement("div");
        card.className = "aluno-card";

        // O curso aparece como etiqueta (span estilizado pelo CSS)
        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta";
        etiqueta.textContent = aluno.curso;

        card.appendChild(criarLinha("Nome:", aluno.nome));
        card.appendChild(etiqueta);
        card.appendChild(criarLinha("Idade:", aluno.idade + " anos", "aluno-meta"));
        card.appendChild(criarLinha("Contato:", aluno.email, "aluno-meta"));

        painel.appendChild(card);
    });
}

// ===== Busca os alunos no servidor e guarda a lista completa =====
async function carregarAlunos() {
    try {
        const resposta = await fetch("/alunos");
        todosAlunos = await resposta.json();
        aplicarFiltro(); // mostra respeitando o filtro escolhido
    } catch (erro) {
        painel.textContent = "Não foi possível carregar os alunos. O servidor está ligado?";
    }
}

// ===== Decide quais alunos mostrar, conforme o filtro de curso =====
function aplicarFiltro() {
    const cursoEscolhido = filtroCurso.value;

    if (cursoEscolhido === "") {
        // "Todos os cursos": mostra a lista completa
        mostrarAlunos(todosAlunos);
    } else {
        // Guarda só os alunos cujo curso é igual ao escolhido
        const filtrados = todosAlunos.filter(function (aluno) {
            return aluno.curso === cursoEscolhido;
        });
        mostrarAlunos(filtrados);
    }
}

// Quando a pessoa troca o curso no filtro, aplica de novo
filtroCurso.addEventListener("change", aplicarFiltro);

// Carrega a lista assim que a página abre
window.addEventListener("DOMContentLoaded", carregarAlunos);