import { Router } from "express"

import CartsController from "./controller/CartsController"

const routes = new Router()
routes.get("/carts", CartsController.index)

export default routes