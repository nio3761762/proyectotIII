
import nodemailer = require('nodemailer')

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: "antoniofernandezt134@gmail.com",
    pass: "naut aezn untq ppln",
  },
});

// yDhS//@123 

transporter.verify().then(() =>{

});