using System.Text;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OrbitDesk.Api.Security;
using OrbitDesk.Api.Services;

// Load environment variables from .env file
if (File.Exists(".env"))
{
    DotNetEnv.Env.Load();
}

var builder = WebApplication.CreateBuilder(args);

// Override configuration with environment variables
builder.Configuration
    .AddEnvironmentVariables("SMTP_")
    .AddEnvironmentVariables("GOOGLE_")
    .AddEnvironmentVariables("GITHUB_")
    .AddEnvironmentVariables("JWT_")
    .AddEnvironmentVariables("DB_");

// Add services to the container.
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddSingleton<JwtTokenService>();

// Configure SMTP settings from appsettings or environment variables
var smtpSettings = new SmtpSettings
{
    Host = builder.Configuration["SMTP_HOST"] ?? builder.Configuration["SmtpSettings:Host"] ?? "smtp.gmail.com",
    Port = int.TryParse(builder.Configuration["SMTP_PORT"] ?? builder.Configuration["SmtpSettings:Port"], out var port) ? port : 587,
    Username = builder.Configuration["SMTP_USERNAME"] ?? builder.Configuration["SmtpSettings:Username"] ?? string.Empty,
    Password = builder.Configuration["SMTP_PASSWORD"] ?? builder.Configuration["SmtpSettings:Password"] ?? string.Empty,
    FromEmail = builder.Configuration["SMTP_FROM_EMAIL"] ?? builder.Configuration["SmtpSettings:FromEmail"] ?? "noreply@orbitdesk.com",
    FromName = builder.Configuration["SMTP_FROM_NAME"] ?? builder.Configuration["SmtpSettings:FromName"] ?? "OrbitDesk"
};
builder.Services.AddSingleton(smtpSettings);
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

// Configure OAuth settings from environment variables
var oauthSettings = new OAuthSettings
{
    Google = new GoogleOAuthSettings
    {
        ClientId = builder.Configuration["GOOGLE_CLIENT_ID"] ?? builder.Configuration["OAuthSettings:Google:ClientId"] ?? string.Empty,
        ClientSecret = builder.Configuration["GOOGLE_CLIENT_SECRET"] ?? builder.Configuration["OAuthSettings:Google:ClientSecret"] ?? string.Empty,
        RedirectUri = builder.Configuration["GOOGLE_REDIRECT_URI"] ?? builder.Configuration["OAuthSettings:Google:RedirectUri"] ?? "http://localhost:5173/auth/callback/google"
    },
    GitHub = new GitHubOAuthSettings
    {
        ClientId = builder.Configuration["GITHUB_CLIENT_ID"] ?? builder.Configuration["OAuthSettings:GitHub:ClientId"] ?? string.Empty,
        ClientSecret = builder.Configuration["GITHUB_CLIENT_SECRET"] ?? builder.Configuration["OAuthSettings:GitHub:ClientSecret"] ?? string.Empty,
        RedirectUri = builder.Configuration["GITHUB_REDIRECT_URI"] ?? builder.Configuration["OAuthSettings:GitHub:RedirectUri"] ?? "http://localhost:5173/auth/callback/github"
    }
};
builder.Services.AddSingleton(oauthSettings);

builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
});

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddDbContext<OrbitDesk.Api.Data.AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>() ?? new JwtSettings();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("LocalDev");
app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.MapControllers();
app.Run();
