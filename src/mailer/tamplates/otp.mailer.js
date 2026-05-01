export const otpEmailTemplate = (otp) => {
  return `
  <div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
      <tr>
        <td align="center">

          <table width="500" style="background:#fff;border-radius:12px;padding:30px;text-align:center;">
            
            <h2 style="color:#111;margin-bottom:10px;">🔐 Verify Your Email</h2>

            <p style="color:#555;font-size:14px;">
              Hey User,<br/>
              Use the OTP below to complete your verification.
            </p>

            <!-- OTP Box -->
            <div style="
              margin:25px auto;
              background:#4f46e5;
              color:#fff;
              padding:15px 25px;
              font-size:24px;
              letter-spacing:5px;
              border-radius:8px;
              display:inline-block;
              font-weight:bold;
            ">
              ${otp}
            </div>

            <p style="color:#777;font-size:13px;">
              This OTP is valid for 5 minutes ⏳
            </p>

            <p style="color:#aaa;font-size:12px;margin-top:20px;">
              If you didn’t request this, ignore this email.
            </p>

            <p style="margin-top:20px;font-size:12px;color:#999;">
              — Team BirthBook
            </p>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;
};