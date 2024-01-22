module.exports = {
  async afterCreate(event) {
    const {
      result: { id, invitee_email, invitee_name, createdBy },
    } = event;
    console.log("Event++: ", event.result);

    try {
      // only send the email if the email is not a job_rejection mail
      await strapi.plugins["email"].services.email.send({
        to: invitee_email,
        from: "SetId <devsetid@gmail.com>",
        subject: "SetId Mediation Invitation",
        html: `<p>Hello ${invitee_name},</p>
               <p>${createdBy?.firstname} ${createdBy?.lastname} has invited you to SetId Mediation. Click the link below to get started:</p>
               <p><a href="${process.env.WEB_URL}get-started?invited_by=${encodeURIComponent(createdBy?.firstname + ' ' + createdBy?.lastname)}&id=${createdBy?.id}&invitation_id=${id}">${process.env.WEB_URL}get-started?invited_by=${encodeURIComponent(createdBy?.firstname + ' ' + createdBy?.lastname)}&id=${createdBy?.id}&invitation_id=${id}</a></p>`
      });
      

    } catch (e) {
      console.log("EMAIL SENDING ERROR: ", e);
    }
  },
};
