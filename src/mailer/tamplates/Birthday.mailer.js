export const birthdayEmailTemplate = (name) => {
  return `
  <div style="margin:0;padding:0;background:#fdf2f8;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
      <tr>
        <td align="center">

          <table width="600" style="
            background:white;
            border-radius:16px;
            overflow:hidden;
            text-align:center;
            box-shadow:0 6px 20px rgba(0,0,0,0.08);
          ">

            <!-- Header -->
            <tr>
              <td style="
                background:linear-gradient(135deg,#ec4899,#8b5cf6);
                color:white;
                padding:30px;
              ">
                <h1 style="margin:0;font-size:28px;">🎉 Happy Birthday 🎂</h1>
              </td>
            </tr>

            <!-- Animated GIF (works like animation) -->
            <tr>
              <td style="padding:20px;">
                <img src="https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif" 
                     alt="birthday"
                     width="200"
                     style="border-radius:10px;" />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:20px 30px;">

                <h2 style="color:#111;">Hey ${name} 👋</h2>

                <p style="color:#555;font-size:15px;line-height:1.6;">
                  Wishing you an amazing birthday filled with happiness, fun, and lots of cake 🎂💙
                </p>

                <p style="color:#555;font-size:15px;">
                  🎈 Enjoy your special day to the fullest!
                </p>

                <!-- Stylish Button -->
                <div style="margin:30px 0;">
                  <a href="#"
                     style="
                       background:linear-gradient(135deg,#ec4899,#8b5cf6);
                       color:white;
                       padding:12px 25px;
                       border-radius:25px;
                       text-decoration:none;
                       font-size:14px;
                       display:inline-block;
                     ">
                     🎁 Celebrate Now
                  </a>
                </div>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="
                background:#f9fafb;
                padding:15px;
                font-size:12px;
                color:#999;
              ">
                Made with 💙 by BirthBook
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;
};