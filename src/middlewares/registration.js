"use strict";

module.exports = () => {
  return async (ctx, next) => {
    await next();

    if (
      ctx.request.url === "/api/auth/local/register" &&
      ctx.response.status === 200
    ) {
      const { email, invitation_id, last_name } = ctx.request.body;
      const userArray = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: { email },
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

      // This will create a case for the parent.
      // if a parent is registering for the first time
      if (!invitation_id && theUserRole !== "mediator") {
        const parentCase = await strapi.entityService.create("api::case.case", {
          data: {
            title: `${last_name} Family`,
            parents: [user.id],
          },
        });
      }

      // if the user wan
      if (invitation_id) {
        const invite = await strapi.entityService.update(
          "api::invitation.invitation",
          invitation_id,
          {
            data: {
              invitee: user.id,
              status: true,
            },
          }
        );

        // Add new  parent to the case created by previous parent
        const getIntiviation = await strapi.entityService.findOne(
          "api::invitation.invitation",
          invitation_id,
          {
            populate: {
              inviter: {
                fields: ["id"],
              },
            },
          }
        );

        console.log(getIntiviation.inviter);

        const getCase = await strapi.entityService.findMany("api::case.case", {
          filters: {
            parents: {
              id: {
                $in: [getIntiviation.inviter.id],
              },
            },
          },
        });

        const updateCase = await strapi.entityService.update(
          "api::case.case",
          getCase[0].id,
          {
            data: {
              parents: [user.id, getIntiviation.inviter.id],
            },
          }
        );
      }
    }
  };
};
