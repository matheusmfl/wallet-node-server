import { Router } from "express"

import CartsController from "./controller/CartsController"
import TransactionsController from "./controller/TransactionsController"

const routes = new Router()
routes.get("/carts", CartsController.index)
routes.post("/carts", CartsController.create)
routes.put('/carts/:id', CartsController.update)
routes.delete('/carts/:id', CartsController.destroy)

export default routes