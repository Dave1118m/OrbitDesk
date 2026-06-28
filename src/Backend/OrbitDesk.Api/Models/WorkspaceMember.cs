namespace OrbitDesk.Api.Models;

public class WorkspaceMember
{
    public int WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public string Role { get; set; } = "Member";
}
