"use strict";

module.exports = () => {
  return async (ctx, next) => {
    await next();

    console.log(ctx.request.body);

    if (
      ctx.request.url === "/api/auth/local/register" &&
      ctx.response.status === 200
    ) {
      const userArray = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: { email: ctx.request.body.email },
        }
      );
      const user = userArray[0];

      // This is the role that the user is going to take
      const theUserRole = ctx.request.body?.role;

      const roles = await strapi.entityService.findMany(
        "plugin::users-permissions.role",
        { filters: { type: theUserRole } }
      );

      const role = roles[0];

      const updateUser = await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            role: role.id,
          },
        }
      );
    }
  };
};
