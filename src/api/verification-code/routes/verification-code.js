module.exports = {
  routes: [
    {
      method: "POST",
      path: "/send-code",
      handler: "verification-code.sendCode",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/verify-code",
      handler: "verification-code.verifyCode",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // {
    //   method: "POST",
    //   path: "/reset-password",
    //   handler: "verification-code.resetPassword",
    // },
  ],
};
