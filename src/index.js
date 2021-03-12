const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(400).json({ erros: "User not found" })
    }

    request.user = user;

    return next();
}

function checksExistsTodo(request, response, next) {
    const { id } = request.params;

    const todo = request.user.todos.find((todo) => todo.id === id);

    if (!todo) {
        return response.status(404).json({ error: "Todo not found" })
    }

    request.todo = todo;

    return next();
}


app.post('/users', (request, response) => {

    const { name, username } = request.body;

    const userAlreadyExists = users.some((user) => user.username === username);

    if (userAlreadyExists) {
        return response.status(400).json({ error: "User already exists" })
    }
    const user = {
        id: uuidv4(),
        name,
        username,
        todos: []
    }
    users.push(user);

    return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    return response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;

    const todo = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        created_at: new Date()
    }

    request.user.todos.push(todo);
    return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    const { title, deadline } = request.body;
    request.todo.title = title;
    request.todo.deadline = new Date(deadline);
    return response.json(request.todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    request.todo.done = true;
    return response.json(request.todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
    request.user.todos.splice(request.todo, 1);
    return response.status(204).json(users);
});

module.exports = app;