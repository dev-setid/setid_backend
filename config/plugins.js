module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        port: env("SMTP_PORT", 587),
        service: "gmail",
        secure: false,
        debug: true,
        ignoreTLS: true,
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
      },
    },
  },
  //..
});
