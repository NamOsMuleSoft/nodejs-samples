/**
 * server.js — Starts the Fastify API (Heroku-ready).
 * Listens on process.env.PORT when run directly; app is in app.js for spec generation.
 */

const { buildApp } = require("./app");

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  buildApp()
    .then((fastify) => {
      return fastify.listen({ port: PORT, host: "0.0.0.0" });
    })
    .then((address) => {
      console.log(`Mock Retail API listening on ${address}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
