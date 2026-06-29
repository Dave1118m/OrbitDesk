namespace OrbitDesk.Api.Services;

public interface IEmailService
{
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string toName, string resetToken, string resetUrl);
    Task<bool> SendVerificationEmailAsync(string toEmail, string toName, string verificationToken, string verificationUrl);
    Task<bool> SendWelcomeEmailAsync(string toEmail, string toName);
    Task<bool> SendOAuthConfirmationEmailAsync(string toEmail, string toName, string provider);
}
