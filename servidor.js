import express from "express";

const app = express();

// Permite ao servidor entender o JSON que o fetch envia
app.use(express.json());

// Entrega ao navegador SOMENTE os arquivos da pasta "public"
// (index.html, style.css e script.js). Assim servidor.js e package.json
// não ficam acessíveis pelo navegador.
app.use(express.static("public"));

// Array que guarda os alunos na memória (some se o servidor for reiniciado)
let alunos = [];

// Rota para cadastrar um novo aluno
app.post("/alunos", (req, res) => {
    const { nome, idade, email, curso } = req.body;

    // Validação no back-end: todos os campos são obrigatórios
    if (!nome || !idade || !email || !curso) {
        return res.status(400).json({ mensagem: "Erro: Todos os campos são obrigatórios!" });
    }

    // Garante a idade mínima mesmo que alguém pule a validação do HTML
    if (parseInt(idade) < 18) {
        return res.status(400).json({ mensagem: "Erro: A idade mínima permitida é 18 anos!" });
    }

    // Monta o objeto do aluno e guarda no array
    const novoAluno = { nome, idade, email, curso };
    alunos.push(novoAluno);

    res.json({
        mensagem: "Aluno cadastrado com sucesso!",
        aluno: novoAluno
    });
});

// Rota para listar todos os alunos cadastrados
app.get("/alunos", (req, res) => {
    res.json(alunos);
});

// Liga o servidor na porta 3000
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});