import { Elysia } from "elysia";
import { createOrder, getOrder } from "../lib/catalog";
import { orders } from "../data/orders";
import type { CreateOrderInput } from "../types";

export const orderRoutes = new Elysia({ prefix: "/orders" })
  .get("/", () => ({ data: Array.from(orders.values()).reverse() }))
  .post("/", ({ body, set }) => {
    try {
      return {
        data: createOrder(body as CreateOrderInput),
      };
    } catch (error) {
      set.status = 400;
      return {
        error: {
          message: error instanceof Error ? error.message : "Failed to create order",
        },
      };
    }
  })
  .get("/:id", ({ params, set }) => {
    try {
      return { data: getOrder(params.id) };
    } catch (error) {
      set.status = 404;
      return {
        error: {
          message: error instanceof Error ? error.message : "Order not found",
        },
      };
    }
  });
