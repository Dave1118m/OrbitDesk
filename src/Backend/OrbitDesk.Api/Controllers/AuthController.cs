using System.Collections.Concurrent;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Security;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwt;
    private static readonly ConcurrentDictionary<string, string> PasswordResetTokens = new();

    public AuthController(AppDbContext db, JwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash) || !user.IsActive)
            return Unauthorized(new { message = "Invalid credentials." });

        var token = _jwt.CreateToken(user);
        return Ok(new AuthResponse(token, user.Name, user.Email, user.Role));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var existing = await _db.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existing)
            return Conflict(new { message = "Email already exists." });

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            IsActive = true,
            Role = "Member"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwt.CreateToken(user);
        return Created(string.Empty, new AuthResponse(token, user.Name, user.Email, user.Role));
    }

    [HttpPost("reset-request")]
    public async Task<IActionResult> ResetRequest(ResetRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user is null)
            return NotFound(new { message = "No account found for that email." });

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24));
        PasswordResetTokens[user.Email.ToLower()] = token;

        // In a real app, send this token by email.
        return Ok(new { message = "Password reset token generated.", token });
    }

    [HttpPost("reset-verify")]
    public async Task<IActionResult> ResetVerify(VerifyResetRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var key = request.Email.ToLower();
        if (!PasswordResetTokens.TryGetValue(key, out var expected) || expected != request.Token)
            return BadRequest(new { message = "Invalid verification token." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user is null)
            return NotFound(new { message = "No account found for that email." });

        user.PasswordHash = PasswordHasher.Hash(request.Password);
        PasswordResetTokens.TryRemove(key, out _);

        await _db.SaveChangesAsync();
        return Ok(new { message = "Password has been reset." });
    }

    [HttpPost("oauth/google")]
    public async Task<ActionResult<AuthResponse>> GoogleOAuth(OAuthCallbackRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // In production, validate the OAuth token with Google's servers
        // For now, accept email and name from the frontend
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user is null)
        {
            // Create new user on first OAuth login
            user = new User
            {
                Name = request.Name ?? "Google User",
                Email = request.Email,
                PasswordHash = PasswordHasher.Hash(Guid.NewGuid().ToString()), // Random password for OAuth users
                IsActive = true,
                Role = "Member"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var token = _jwt.CreateToken(user);
        return Ok(new AuthResponse(token, user.Name, user.Email, user.Role));
    }

    [HttpPost("oauth/github")]
    public async Task<ActionResult<AuthResponse>> GitHubOAuth(OAuthCallbackRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // In production, validate the OAuth token with GitHub's servers
        // For now, accept email and name from the frontend
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user is null)
        {
            // Create new user on first OAuth login
            user = new User
            {
                Name = request.Name ?? "GitHub User",
                Email = request.Email,
                PasswordHash = PasswordHasher.Hash(Guid.NewGuid().ToString()), // Random password for OAuth users
                IsActive = true,
                Role = "Member"
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        var token = _jwt.CreateToken(user);
        return Ok(new AuthResponse(token, user.Name, user.Email, user.Role));
    }
}
