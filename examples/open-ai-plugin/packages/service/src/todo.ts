import { extendApi } from "@anatine/zod-openapi";
import { command, entity } from "@eventual/core";
import { ulid } from "ulidx";
import z from "zod";

const userNameSchema = extendApi(z.string(), {
  description: "The name of the user",
});

const todoIdSchema = extendApi(z.string(), {
  description: "Id of a single todo item",
});

const todoTextSchema = extendApi(z.string(), {
  description: "The display text of a single todo task",
});

const todoSchema = z.object({
  username: userNameSchema,
  todoId: todoIdSchema,
  text: todoTextSchema,
});

const todos = entity("todos", todoSchema);

export const addTodo = command(
  "addTodo",
  {
    summary: "Add a todo to the list",
    path: "/:username/todos",
    method: "POST",
    params: {
      username: "path",
    },
    input: todoSchema.omit({ todoId: true }),
    output: todoSchema,
  },
  async (request) => {
    const id = ulid();

    const todo: z.infer<typeof todoSchema> = {
      text: request.text,
      username: request.username,
      todoId: id,
    };

    await todos.set({ namespace: request.username, key: id }, todo);

    return todo;
  }
);

export const deleteTodo = command(
  "deleteTodo",
  {
    description: "Delete a todo from the list",
    path: "/:username/todos/:todoId",
    method: "DELETE",
    params: {
      username: "path",
      todoId: "path",
    },
    input: todoSchema.omit({ text: true }),
  },
  async (request) => {
    await todos.delete({ namespace: request.username, key: request.todoId });
  }
);

export const getTodos = command(
  "getTodos",
  {
    summary: "Get the list of todos",
    path: "/:username/todos",
    method: "GET",
    params: {
      username: "path",
    },
    input: z.object({ username: userNameSchema }),
    output: z.object({
      items: extendApi(z.array(todoSchema), {
        description: "A list of todo items for the user",
      }),
    }),
  },
  async (request) => {
    const entries =
      (await todos.list({ namespace: request.username }))?.entries ?? [];

    return {
      items: entries?.map((e) => e.entity),
    };
  }
);
