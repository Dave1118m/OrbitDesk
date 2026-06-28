using System.ComponentModel.DataAnnotations;

namespace OrbitDesk.Api.Dto;

public record UserResponse(int Id, string Name, string Email, bool IsActive, string Role);

public class CreateUserRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [Required]
    public string Role { get; set; } = "Member";
}

public class UpdateUserRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public bool IsActive { get; set; }

    [Required]
    public string Role { get; set; } = "Member";
}