using System.ComponentModel.DataAnnotations;

namespace OrbitDesk.Api.Dto;

public record ProjectResponse(int Id, string Title, string Description, int WorkspaceId, DateTime StartDate, DateTime EndDate, decimal Budget, string Status);

public class CreateProjectRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int WorkspaceId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Budget { get; set; }

    [Required]
    public string Status { get; set; } = "Planning";
}

public class UpdateProjectRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public int WorkspaceId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Budget { get; set; }

    [Required]
    public string Status { get; set; } = "Planning";
}