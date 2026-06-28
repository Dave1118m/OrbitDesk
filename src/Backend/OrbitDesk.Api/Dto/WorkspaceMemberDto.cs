using System.ComponentModel.DataAnnotations;

namespace OrbitDesk.Api.Dto;

public record WorkspaceMemberResponse(int WorkspaceId, int UserId, string Role);

public class CreateWorkspaceMemberRequest
{
    [Required]
    public int WorkspaceId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string Role { get; set; } = "Member";
}

public class RemoveWorkspaceMemberRequest
{
    [Required]
    public int WorkspaceId { get; set; }

    [Required]
    public int UserId { get; set; }
}