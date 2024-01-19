module.exports = {
  async afterCreate(event) {
    const {
      result: { id, inviter, invitee_email, invitee_name, createdBy },
    } = event;
    console.log("Event++: ", event.result);

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: {  id: parseInt(inviter) },
      });

    if (!user) {
      return
    }

    try {
      // only send the email if the email is not a job_rejection mail
      await strapi.plugins["email"].services.email.send({
        to: invitee_email,
        from: "SetId <devsetid@gmail.com>",
        subject: "SetId Mediation Invitation",
        html: `<p>Hello ${invitee_name},</p>
               <p>${user?.firstname} ${user?.lastname} has invited you to SetId Mediation. Click the link below to get started:</p>
               <p><a href="http://localhost:3000/get-started?invited_by=${encodeURIComponent(createdBy?.firstname + ' ' + createdBy?.lastname)}&id=${createdBy?.id}&invitation_id=${id}">http://localhost:3000/get-started?invited_by=${encodeURIComponent(createdBy?.firstname + ' ' + createdBy?.lastname)}&id=${createdBy?.id}&invitation_id=${id}</a></p>`
      });      

    } catch (e) {
      console.log("EMAIL SENDING ERROR: ", e);
    }
  },
};
