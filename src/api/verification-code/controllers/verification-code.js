"use strict";

/**
 * verification-code controller
 */

// const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {
  /**
   * @param {{ request: { body: { email: any; }; }; throw: (arg0: number, arg1: string) => any; send: (arg0: { status: boolean; message: string; }) => void; }} ctx
   */

  async sendCode(ctx) {
    const { email } = ctx.request.body;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: email } });

    if (!user) {
      console.log("This us here");
      return ctx.throw(400, "User not found");
    }

    console.log(user);

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    const verificationCodes = await strapi.db
      .query("api::verification-code.verification-code")
      .findMany({
        // @ts-ignore
        user: { email },
        status: false,
      });

    console.log(verificationCodes);

    for (const codeEntry of verificationCodes) {
      await strapi.db.query("api::verification-code.verification-code").update({
        where: {
          id: codeEntry.id,
        },
        data: {
          status: true,
        },
      });
    }

    const verificationCode = await strapi.db
      .query("api::verification-code.verification-code")
      .create({
        data: {
          code: resetCode,
          user: user.id,
          status: false,
        },
      });

    const publishedVerificationCode = await strapi.db
      .query("api::verification-code.verification-code")
      .update({
        where: { id: verificationCode.id },
        data: {
          publishedAt: new Date(),
        },
      });

    const isEmailSend = await strapi
      .plugin("email")
      .service("email")
      .send({
        to: email,
        from: `SetID <${process.env.SMTP_USERNAME}>`,
        subject: "Password Reset for SetID",
        text: `Hello,
            You have requested to reset your password for your SetID account.
            Please use the following 4-digit code to proceed with the password reset:
            Code: ${resetCode}

            If you did not initiate this request, you can safely ignore this email.

            Best regards,
            The SetID Team`,
        html: `
        <h4>Password Reset for SetID</h4>
        <p>You have requested to reset your password for your SetID account.</p>
        <p>Please use the following 4-digit code to proceed with the password reset:</p>
        <p><strong>Code: ${resetCode}</strong></p>
        <p>If you did not initiate this request, you can safely ignore this email.</p>
        <p>Best regards,<br />The SetID Team</p>
      `,
      });

    ctx.send({ status: true, message: "Reset code sent successfully" });
  },

  /**
   * @param {{ request: { body: { code: any; email: any; }; }; throw: (arg0: number, arg1: string) => any; send: (arg0: { status: boolean; message: string; }) => void; }} ctx
   */
  async verifyCode(ctx) {
    const { code, email } = ctx.request.body;

    // Query the verification code based on the provided code and email
    const verificationCode = await strapi
      .query("api::verification-code.verification-code")
      .findOne({
        where: {
          user: { email },
          status: false,
          code: code,
        },
      });

    if (!verificationCode) {
      return ctx.throw(400, "Invalid verification code");
    }

    // Update the status field to true
    const updatedVerificationCode = await strapi.db
      .query("api::verification-code.verification-code")
      .update({
        where: {
          id: verificationCode.id,
        },
        data: {
          status: true,
        },
      });

    ctx.send({ status: true, message: "Verification code is valid" });
  },

  /**
   * @param {{ request: { body: { code: any; email: any; new_password: any; }; }; throw: (arg0: number, arg1: string) => any; send: (arg0: { status: boolean; message: string; }) => void; }} ctx
   */
  async resetPassword(ctx) {
    const { code, email, new_password } = ctx.request.body;

    const verificationCode = await strapi
      .query("api::verification-code.verification-code")
      .findOne({
        where: {
          user: { email },
          code: code,
          status: true,
        },
      });

    console.log(verificationCode);

    if (!verificationCode) {
      return ctx.throw(400, "Invalid verification code");
    }

    // Find the user based on the email
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { email },
      });

    if (!user) {
      return ctx.throw(400, "User not found");
    }

    // Check if the new password matches the user's current password
    const isCurrentPassword = await strapi.admin.services.auth.validatePassword(
      new_password,
      user.password
    );

    if (isCurrentPassword) {
      return ctx.throw(400, "New password matches the current password");
    }

    // Update the user's password
    const hashedPassword = await strapi.admin.services.auth.hashPassword(
      new_password
    );

    await strapi.db.query("plugin::users-permissions.user").update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark the verification code as used (optional)
    await strapi.query("api::verification-code.verification-code").update({
      where: { id: verificationCode.id },
      data: { status: true },
    });

    ctx.send({ status: true, message: "Password reset successful" });
  },
};
