const nodeMailer = require('nodemailer');
const JWT = require('jsonwebtoken')
const { jwtSecret } = require('../config')

const mailToken = user => {
  return JWT.sign(
  {
    iss: 'inflowmusic',
    sub: {
      id: user.id,
      email: user.email,
    },
    iat: new Date().getTime(), // current time
    exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
  }, jwtSecret);
}
//This is for changing password
exports.emailToResetPassword = async (user) => {
  var transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'test1@inflowmusic.io',
        pass: 'ECZ3cby5KuE7v25'
    }
  });
  const token = mailToken(user)
  const link = process.env.NODE_ENV === 'production'
              ?`https://reverent-clarke-14b5b9.netlify.app/auth/resetpassword?token=${token}`
              :`http://localhost:3000/auth/resetpassword?token=${token}`
    
  var mailOptions = {
      from: 'inflowmusic.io', // sender address (who sends)
      to: user.email, // list of receivers (who receives)
      subject: `Reset your password for Inflow-Music`, // Subject line
      html: `
        <div>
          <p>Follow this link to change your password.</p>
          <p><a href=${link} target="_blank">${link}</a></p>
          <p>If you didn’t ask to reset your password, you can ignore this email.</p>
          <p>Thanks,<br>
          <p>Inflow Music</p>
        </div>
      ` 
  };
  
  try {
    await transporter.sendMail(mailOptions);
  } catch(e) {
    throw e
  }
};

//This is for sign up verification
exports.emailToVerify = async (user) => {
    var transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'test1@inflowmusic.io',
          pass: 'ECZ3cby5KuE7v25'
      }
    });
    const token = mailToken(user)
    const link = process.env.NODE_ENV === 'production'
                ?`https://reverent-clarke-14b5b9.netlify.app/auth/verifyemail?token=${token}`
                :`http://localhost:3000/auth/verifyemail?token=${token}`
      
    var mailOptions = {
        from: 'inflowmusic.io', // sender address (who sends)
        to: user.email, // list of receivers (who receives)
        subject: `Verify your email for Inflow-Music`, // Subject line
        html: `
          <div>
            <p>Follow this link to verify your email address.</p>
            <p><a href=${link} target="_blank">${link}</a></p>
            <p>Thanks,<br>
            <p>Inflow Music</p>
          </div>
        ` 
    };
    
    try {
      await transporter.sendMail(mailOptions);
    } catch(e) {
      throw e
    }
  };
  
