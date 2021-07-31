const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const date = require("date-fns");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBWithServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBWithServer();

const hasPriorityAndStatusAndCategoryAndDueDateProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined &&
    requestQuery.status !== undefined &&
    requestQuery.category !== undefined &&
    requestQuery.due_date !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasDueDateProperty = (requestQuery) => {
  return requestQuery.due_date !== undefined;
};

//GET Todo
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status, category, due_date } = request.query;

  switch (true) {
    case hasPriorityAndStatusAndCategoryAndDueDateProperties(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE 
                todo LIKE '%${search_q}%',
                status = '${status}',
                priority = '${priority}',
                category = '${category}',
                due_date = '${due_date}';`;
      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodoQuery = `SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%',
            category = '${category}',
            priority = '${priority}';`;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodoQuery = `SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%',
            category = '${category}',
            status = '${status}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%',
            priority = '${priority}'`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%',
            status = '${status}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodoQuery = `SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%',
            category = '${category}'`;
      break;
    case hasDueDateProperty(request.query):
      getTodoQuery = `SELECT *
            FROM todo WHERE
            todo LIKE '%${search_q}%',
            due_date = '${due_date}';`;
      break;
    default:
      getTodoQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%';`;

      data = await db.all(getTodoQuery);
      response.send(data);
  }
});

// Get todo item API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoItemQuery = `SELECT * FROM todo
    WHERE id = '${todoId}';`;
  const todoItem = db.all(getTodoItemQuery);
  response.send(todoItem);
});

//Get agenda
app.get("/agenda/", async (request, response) => {
  const { date } = request.params;
  const getAgenda = `SELECT * FROM todo
    WHERE due_date = '${date}';`;
  const agendaItem = db.get(getAgenda);
  response.send(agendaItem);
});

//Create todo

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodoQuery = `INSERT INTO 
    todo(id, todo, category, priority, status, due_date)
    VALUES (
        id = '${id}',
        todo = '${todo}',
        priority = '${priority}',
        status = '${status}',
        due_date = '${dueDate}'
    )`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//Update todo API

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, category, priority, status, dueDate } = request.body;
  const updateTodoQuery = `UPDATE todo
    SET 
        todo = '${todo}',
        category = '${category}',
        priority = '${priority}',
        status = '${status}',
        due_date = '${dueDate}'
    WHERE 
        id = '${todoId}';`;
  const todoUpdated = await db.run(updateTodoQuery);
  response.send();
});

//DELETE todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo
    WHERE id = '${todoId}';`;
  response.send("Todo Deleted");
});

module.exports = app;
