export const welcomeEmailTemplate = (name) => {
  return `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 0;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5,#9333ea);padding:30px;text-align:center;color:white;">
                <h1 style="margin:0;font-size:28px;">🎉 BirthBook</h1>
                <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Never miss a birthday again</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <h2 style="margin-top:0;color:#111;">Hey ${name} 👋</h2>
                
                <p style="color:#555;font-size:15px;line-height:1.6;">
                  Welcome to <b>BirthBook</b> 🚀<br/>
                  We’re building something amazing to help you track birthdays and celebrate every special moment 🎂
                </p>

                <!-- Features -->
                <div style="margin:20px 0;">
                  <p style="margin:0;color:#333;"><b>✨ What you'll get:</b></p>
                  <ul style="padding-left:20px;color:#555;line-height:1.8;">
                    <li>📅 Track all birthdays easily</li>
                    <li>⏳ Live countdowns</li>
                    <li>🎂 Never miss a celebration</li>
                  </ul>
                </div>

                <p style="color:#555;font-size:15px;">
                  ⏳ We’re almost ready. Stay tuned for the launch!
                </p>

                <!-- Button -->
                <div style="text-align:center;margin:30px 0;">
                  <a href="#" 
                     style="background:#4f46e5;color:white;padding:12px 25px;
                     text-decoration:none;border-radius:8px;font-size:14px;
                     display:inline-block;">
                     🚀 Coming Soon
                  </a>
                </div>

                <p style="color:#999;font-size:13px;">
                  — Team BirthBook 💙
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
                © 2026 BirthBook. All rights reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;
};