import express from 'express';
import banco from './database/config.js'; 
import cors from 'cors';


const app = express();

const port = process.env.PORT || 3000;

const users = []

// Configuração do middleware
app.use(cors());
app.use(express.json());
app.use(express.static('Public'));

// Rota para listar tarefas
app.get('/tarefas', (req, res) => {
    const sql = 'SELECT id, nome, custo, data_limite, ordem_apresentacao FROM tarefas ORDER BY ordem_apresentacao';
    banco.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao executar a consulta', err);
            return res.status(500).json({ error: 'Erro ao obter tarefas' });
        }
        res.json(result);
    });
});

// Rota para editar a tarefa
app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, custo, data_limite } = req.body;

    if (!nome || !custo || !data_limite) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    banco.query('SELECT * FROM tarefas WHERE nome = ? AND id != ?', [nome, id], (err, result) => {
        if (err) {
            console.error('Erro ao verificar tarefa existente', err);
            return res.status(500).json({ error: 'Erro ao verificar tarefa' });
        }

        if (result.length > 0) {
            return res.status(400).json({ error: 'Tarefa com este nome já existe' });
        }

        banco.query(
            'UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?',
            [nome, custo, data_limite, id],
            (err, result) => {
                if (err) {
                    console.error('Erro ao atualizar tarefa', err);
                    return res.status(500).json({ error: 'Erro ao atualizar tarefa' });
                }
                res.json({ message: 'Tarefa atualizada com sucesso' });
            }
        );
    });
});

// Rota para adicionar tarefa
app.post('/tarefas', (req, res) => {
    const { nome, custo, data_limite } = req.body;

    if (!nome || !custo || !data_limite) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    banco.query('SELECT MAX(ordem_apresentacao) AS maxOrder FROM tarefas', (err, result) => {
        if (err) {
            console.error('Erro ao obter ordem', err);
            return res.status(500).json({ error: 'Erro ao obter a ordem de tarefas' });
        }

        const maxOrder = result[0].maxOrder || 0;
        const novaOrdem = maxOrder + 1;

        const sql = 'INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao) VALUES (?, ?, ?, ?)';
        banco.query(sql, [nome, custo, data_limite, novaOrdem], (err, result) => {
            if (err) {
                console.error('Erro ao inserir tarefa', err);
                return res.status(500).json({ error: 'Erro ao adicionar tarefa' });
            }
            res.status(201).json({ message: 'Tarefa adicionada com sucesso' });
        });
    });
});

// Rota para excluir tarefa
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;

    banco.query('DELETE FROM tarefas WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir tarefa', err);
            return res.status(500).json({ error: 'Erro ao excluir tarefa' });
        }
        res.json({ message: 'Tarefa excluída com sucesso' });
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});