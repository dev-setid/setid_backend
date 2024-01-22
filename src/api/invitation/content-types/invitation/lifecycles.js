module.exports = {
  async afterCreate(event) {
    const {
      result: { id, invitee_email, invitee_name, createdBy },
    } = event;
    console.log("Event++: ", event.result);

    console.log(event);

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      event?.params?.data?.user
    );

    console.log(user);

    try {
      // only send the email if the email is not a job_rejection mail
      await strapi.plugins["email"].services.email.send({
        to: invitee_email,
        from: "SetId <devsetid@gmail.com>",
        subject: "SetId Mediation Invitation",
        html: `<p>Hello ${invitee_name},</p>
               <p>${user?.first_name} ${
          user?.last_name
        } has invited you to SetId Mediation. Click the link below to get started:</p>
               <p><a href="${
                 process.env.WEB_URL
               }get-started?invited_by=${encodeURIComponent(
          user?.first_name + " " + user?.last_name
        )}&id=${user?.id}&invitation_id=${id}">${
          process.env.WEB_URL
        }get-started?invited_by=${encodeURIComponent(
          user?.first_name + " " + user?.last_name
        )}&id=${user?.id}&invitation_id=${id}</a></p>`,
      });
    } catch (e) {
      console.log("EMAIL SENDING ERROR: ", e);
    }
  },
};
