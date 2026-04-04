// Barrel export for all Mongoose models
export { default as User } from "./User";
export { default as Category } from "./Category";
export { default as Brand } from "./Brand";
export { default as Product } from "./Product";
export { default as Order } from "./Order";

// Type exports
export type { IUser } from "./User";
export type { ICategory } from "./Category";
export type { IBrand } from "./Brand";
export type { IProduct } from "./Product";
export type { IOrder, IOrderItem, OrderStatus } from "./Order";
