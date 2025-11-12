"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer = require("nodemailer");
exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "antoniofernandezt134@gmail.com",
        pass: "naut aezn untq ppln",
    },
});
// yDhS//@123 
exports.transporter.verify().then(() => {
    console.log('Ready for send emailds');
});
