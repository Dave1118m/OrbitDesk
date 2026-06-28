using System.ComponentModel.DataAnnotations;

namespace OrbitDesk.Api.Dto;

public record OrganizationMemberResponse(int OrganizationId, int UserId, string Role);

public class CreateOrganizationMemberRequest
{
    [Required]
    public int OrganizationId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string Role { get; set; } = "Member";
}

public class RemoveOrganizationMemberRequest
{
    [Required]
    public int OrganizationId { get; set; }

    [Required]
    public int UserId { get; set; }
}