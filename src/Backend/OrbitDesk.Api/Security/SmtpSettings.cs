namespace OrbitDesk.Api.Security;

public class SmtpSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "OrbitDesk";

    public bool IsConfigured => !string.IsNullOrEmpty(Host) && !string.IsNullOrEmpty(Username) && !string.IsNullOrEmpty(Password);
}
