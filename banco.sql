CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    custo VARCHAR(10, 2) NOT NULL,
    data_limite DATE NOT NULL,
    ordem_apresentacao INT NOT NULL
)