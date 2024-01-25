"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    let { Server } = require("socket.io");

    console.log("Helllo");
    console.log(Server);

    let io = new Server(strapi.server.httpServer, {
      cors: {
        origin: ["http://localhost:3000", `${process.env.FRONTEND_URL}:*`],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("user just connected", socket.id);

      let activeUsers = [];

      // when a user is added to a chat
      socket.on("new-user-add", (newUserId) => {
        console.log(newUserId);
        if (!activeUsers.some((user) => user.id === newUserId)) {
          activeUsers.push({ id: newUserId, socekId: socket.id });
        }

        console.log("This is the active user", activeUsers);

        io.emit("get-users", activeUsers);
      });

      // Send message to a client
      socket.on("send-message", (data) => {
        const { recieverId } = data;
        const user = activeUsers.find((user) => user.id === recieverId);

        if (user) {
          io.to(user.socekId).emit("recieve-message", data);
        }
      });

      // When the user disconnects
      socket.on("disconnect", (data) => {
        console.log("disconnected");
        activeUsers = activeUsers.filter((user) => user.socekId);
        io.emit("get-users", activeUsers);
      });
    });
  },
};
