using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        var users = await _db.Users
            .AsNoTracking()
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.IsActive, u.Role))
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> Get(int id)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.IsActive, u.Role))
            .FirstOrDefaultAsync();

        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var existing = await _db.Users.AnyAsync(u => u.Email == request.Email);
        if (existing)
            return Conflict(new { message = "Email already exists." });

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = request.PasswordHash,
            IsActive = request.IsActive,
            Role = request.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = user.Id }, new UserResponse(user.Id, user.Name, user.Email, user.IsActive, user.Role));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserResponse>> Update(int id, UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        if (user.Email != request.Email)
        {
            var emailInUse = await _db.Users.AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailInUse)
                return Conflict(new { message = "Email already exists." });
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.IsActive = request.IsActive;
        user.Role = request.Role;

        await _db.SaveChangesAsync();

        return Ok(new UserResponse(user.Id, user.Name, user.Email, user.IsActive, user.Role));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
