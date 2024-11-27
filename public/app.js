(function () {
    "use strict";

    const  baseUrl = "https://todolist-nine-vert.vercel.app/"

    // Definindo a função Task
    function Task(id, name, cost, dueDate, completed = false, createdAt = Date.now(), updatedAt = null) {
        if (!name) {
            throw new Error("Task needs a mandatory 'name' parameter");
        }

        this.id = id;
        this.name = name;
        this.cost = cost;
        this.dueDate = dueDate;
        this.completed = completed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.toggleCompleted = function () {
            this.completed = !this.completed;
        };

        this.getName = () => this.name;
        this.getCost = () => this.cost;
        this.getDueDate = () => this.dueDate;
        this.changeName = function (newName) {
            this.name = newName;
            this.updatedAt = Date.now();
        };
        this.changeCost = function (newCost) {
            this.cost = newCost;
            this.updatedAt = Date.now();
        };
        this.changeDueDate = function (newDate) {
            this.dueDate = newDate;
            this.updatedAt = Date.now();
        };
    }

    let tasks = [];

    const inputName = document.getElementById("item-input");
    const inputCost = document.getElementById("item-cost");
    const inputDueDate = document.getElementById("item-due-date");
    const formAddTask = document.getElementById("todo-add");
    const tasksList = document.getElementById("todo-list");

    // Função para renderizar as tarefas na tela
    function generateTaskLi(task, index) {
        const li = document.createElement("li");
        const p = document.createElement("p");
        const btnCheck = document.createElement("button");
        const btnEdit = document.createElement("i");
        const btnDelete = document.createElement("i");

        li.className = "task-item";

        btnCheck.className = "button-check";
        btnCheck.innerHTML = `<i class="fas fa-check ${task.completed ? "displayVisible" : "displayNone"}" data-action="checkButton"></i>`;
        btnCheck.setAttribute("data-action", "checkButton");
        btnCheck.setAttribute("data-index", index);
        li.appendChild(btnCheck);

        p.className = "task-name";
        p.textContent = task.getName();
        li.appendChild(p);

        const costSpan = document.createElement("span");
        costSpan.className = "task-cost";
        costSpan.textContent = `R$ ${task.getCost()}`;
        if (task.getCost() >= 1000) {
            costSpan.classList.add("high-cost");
        }
        li.appendChild(costSpan);

        const dueDateSpan = document.createElement("span");
        dueDateSpan.className = "task-due-date";
        dueDateSpan.textContent = `Due: ${task.getDueDate()}`;
        li.appendChild(dueDateSpan);

        btnEdit.className = "fas fa-edit";
        btnEdit.setAttribute("data-action", "editButton");
        btnEdit.setAttribute("data-index", index);
        li.appendChild(btnEdit);

        btnDelete.className = "fas fa-trash-alt";
        btnDelete.setAttribute("data-action", "deleteButton");
        btnDelete.setAttribute("data-index", index);
        li.appendChild(btnDelete);

        const editContainer = document.createElement("div");
        editContainer.className = "editContainer";
        editContainer.style.display = "none";

        const inputNameEdit = document.createElement("input");
        inputNameEdit.className = "editInput";
        inputNameEdit.value = task.getName();

        const inputCostEdit = document.createElement("input");
        inputCostEdit.className = "editInput";
        inputCostEdit.value = task.getCost();

        const inputDateEdit = document.createElement("input");
        inputDateEdit.className = "editInput";
        inputDateEdit.value = task.getDueDate();

        const btnSave = document.createElement("button");
        btnSave.textContent = "Save";
        btnSave.setAttribute("data-action", "containerEditButton");
        btnSave.setAttribute("data-index", index);

        const btnCancel = document.createElement("button");
        btnCancel.textContent = "Cancel";
        btnCancel.setAttribute("data-action", "containerCancelButton");
        btnCancel.setAttribute("data-index", index);

        editContainer.appendChild(inputNameEdit);
        editContainer.appendChild(inputCostEdit);
        editContainer.appendChild(inputDateEdit);
        editContainer.appendChild(btnSave);
        editContainer.appendChild(btnCancel);

        li.appendChild(editContainer);

        return li;
    }

    // Função para renderizar as tarefas na tela
    function renderTasks() {
        tasksList.innerHTML = "";
        tasks.forEach((task, index) => {
            tasksList.appendChild(generateTaskLi(task, index));
        });
    }

    // Função para adicionar a tarefa ao banco de dados e na lista
    function addTaskToDB(name, cost, dueDate) {
        fetch('http://localhost:3000/tarefas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: name, custo: cost, data_limite: dueDate })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            tasks.push(new Task(data.id, name, cost, dueDate)); // Atualizando tarefas com o ID gerado pelo backend
            renderTasks();
        })
        .catch(error => console.error('Erro ao adicionar tarefa:', error));
    }

    // Função para atualizar a tarefa no banco de dados
    function updateTaskInDB(id, name, cost, dueDate) {
        fetch(`http://localhost:3000/tarefas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome: name, custo: cost, data_limite: dueDate })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // Encontrar a tarefa na lista local e atualizar com os novos valores
            const task = tasks.find(t => t.id == id);
            if (task) {
                task.changeName(name);
                task.changeCost(cost);
                task.changeDueDate(dueDate);
            }
            renderTasks(); // Re-renderiza a lista de tarefas
        })
        .catch(error => console.error('Erro ao atualizar tarefa:', error));
    }

    // Função para excluir a tarefa do banco de dados
    function deleteTaskFromDB(id, index) {
        fetch(`http://localhost:3000/tarefas/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // Remover a tarefa do array local
            tasks.splice(index, 1);
            renderTasks(); // Re-renderiza a lista de tarefas após a exclusão
        })
        .catch(error => console.error('Erro ao excluir tarefa:', error));
    }

    formAddTask.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = inputName.value.trim();
        const cost = parseFloat(inputCost.value);
        const dueDate = inputDueDate.value;

        if (!name || isNaN(cost) || !dueDate) {
            alert("Por favor, preencha todos os campos corretamente.");
            return;
        }

        addTaskToDB(name, cost, dueDate);

        inputName.value = "";
        inputCost.value = "";
        inputDueDate.value = "";
        inputName.focus();
    });

    tasksList.addEventListener("click", function (e) {
        const action = e.target.getAttribute("data-action");
        const index = e.target.getAttribute("data-index");

        if (!action || index === undefined) return;

        const currentLi = tasksList.children[index];
        const task = tasks[index];

        if (action === "checkButton") {
            task.toggleCompleted();
            renderTasks();
        } else if (action === "editButton") {
            // Mostra o formulário de edição
            [...tasksList.querySelectorAll(".editContainer")].forEach(container => container.style.display = "none");
            currentLi.querySelector(".editContainer").style.display = "flex";
        } else if (action === "deleteButton") {
            if (confirm("Are you sure you want to delete this task?")) {
                deleteTaskFromDB(task.id, index);
            }
        } else if (action === "containerEditButton") {
            const name = currentLi.querySelector(".editInput:nth-of-type(1)").value;
            const cost = currentLi.querySelector(".editInput:nth-of-type(2)").value;
            const date = currentLi.querySelector(".editInput:nth-of-type(3)").value;

            // Atualiza a tarefa no backend e na lista local
            updateTaskInDB(task.id, name, parseFloat(cost), date);
        } else if (action === "containerCancelButton") {
            currentLi.querySelector(".editContainer").style.display = "none";
        }
    });

    renderTasks();
})();