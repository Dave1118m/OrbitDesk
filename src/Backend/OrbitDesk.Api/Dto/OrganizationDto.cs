using System.ComponentModel.DataAnnotations;

namespace OrbitDesk.Api.Dto;

public record OrganizationResponse(int Id, string Name, string Description, string Country, string RegistrationNumber, int OwnerId);

public class CreateOrganizationRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Country { get; set; } = string.Empty;

    [Required]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required]
    public int OwnerId { get; set; }
}

public class UpdateOrganizationRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Country { get; set; } = string.Empty;

    [Required]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required]
    public int OwnerId { get; set; }
}