using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using OrbitDesk.Api.Security;

namespace OrbitDesk.Api.Services;

public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly SmtpSettings _smtpSettings;

    public SmtpEmailService(ILogger<SmtpEmailService> logger, SmtpSettings smtpSettings)
    {
        _logger = logger;
        _smtpSettings = smtpSettings;
    }

    public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string toName, string resetToken, string resetUrl)
    {
        if (!_smtpSettings.IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured. Password reset token for {Email}: {Token}", toEmail, resetToken);
            return true; // Return true but log the token for testing
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = "Reset Your OrbitDesk Password";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <h2>Password Reset Request</h2>
                    <p>Hi {toName},</p>
                    <p>We received a request to reset your OrbitDesk password. Click the link below to proceed:</p>
                    <p><a href='{resetUrl}?token={resetToken}'>Reset Password</a></p>
                    <p>Or use this code: <strong>{resetToken}</strong></p>
                    <p>If you didn't request this, ignore this email.</p>
                    <p>Best regards,<br/>OrbitDesk Team</p>
                "
            };
            email.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                await client.SendAsync(email);
                await client.DisconnectAsync(true);
            }

            _logger.LogInformation("Password reset email sent to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendVerificationEmailAsync(string toEmail, string toName, string verificationToken, string verificationUrl)
    {
        if (!_smtpSettings.IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured. Verification token for {Email}: {Token}", toEmail, verificationToken);
            return true;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = "Verify Your OrbitDesk Email";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <h2>Verify Your Email</h2>
                    <p>Hi {toName},</p>
                    <p>Welcome to OrbitDesk! Click the link below to verify your email:</p>
                    <p><a href='{verificationUrl}?token={verificationToken}'>Verify Email</a></p>
                    <p>Or use this code: <strong>{verificationToken}</strong></p>
                    <p>Best regards,<br/>OrbitDesk Team</p>
                "
            };
            email.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                await client.SendAsync(email);
                await client.DisconnectAsync(true);
            }

            _logger.LogInformation("Verification email sent to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendWelcomeEmailAsync(string toEmail, string toName)
    {
        if (!_smtpSettings.IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured. Welcome email for {Email}", toEmail);
            return true;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = "Welcome to OrbitDesk!";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <h2>Welcome to OrbitDesk!</h2>
                    <p>Hi {toName},</p>
                    <p>Your account has been created successfully. You can now log in and start managing your workspace.</p>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    <p>Best regards,<br/>OrbitDesk Team</p>
                "
            };
            email.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                await client.SendAsync(email);
                await client.DisconnectAsync(true);
            }

            _logger.LogInformation("Welcome email sent to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendOAuthConfirmationEmailAsync(string toEmail, string toName, string provider)
    {
        if (!_smtpSettings.IsConfigured)
        {
            _logger.LogWarning("SMTP is not configured. OAuth confirmation email for {Email} via {Provider}", toEmail, provider);
            return true;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_smtpSettings.FromName, _smtpSettings.FromEmail));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = "OrbitDesk Account Connected";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <h2>Account Connected</h2>
                    <p>Hi {toName},</p>
                    <p>Your OrbitDesk account has been successfully connected via {provider}.</p>
                    <p>You can now sign in using your {provider} account.</p>
                    <p>Best regards,<br/>OrbitDesk Team</p>
                "
            };
            email.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
                await client.SendAsync(email);
                await client.DisconnectAsync(true);
            }

            _logger.LogInformation("OAuth confirmation email sent to {Email} for provider {Provider}", toEmail, provider);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OAuth confirmation email to {Email}", toEmail);
            return false;
        }
    }
}
