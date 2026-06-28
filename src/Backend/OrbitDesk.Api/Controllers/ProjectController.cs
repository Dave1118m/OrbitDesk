using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProjectController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectResponse>>> GetAll()
    {
        var projects = await _db.Projects
            .AsNoTracking()
            .Select(p => new ProjectResponse(p.Id, p.Title, p.Description, p.WorkspaceId, p.StartDate, p.EndDate, p.Budget, p.Status))
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectResponse>> Get(int id)
    {
        var project = await _db.Projects
            .AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProjectResponse(p.Id, p.Title, p.Description, p.WorkspaceId, p.StartDate, p.EndDate, p.Budget, p.Status))
            .FirstOrDefaultAsync();

        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResponse>> Create(CreateProjectRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var workspace = await _db.Workspaces.FindAsync(request.WorkspaceId);
        if (workspace is null)
            return BadRequest(new { message = "Workspace does not exist." });

        if (request.EndDate < request.StartDate)
            return BadRequest(new { message = "EndDate must be after StartDate." });

        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            WorkspaceId = request.WorkspaceId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Budget = request.Budget,
            Status = request.Status
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = project.Id }, new ProjectResponse(project.Id, project.Title, project.Description, project.WorkspaceId, project.StartDate, project.EndDate, project.Budget, project.Status));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectResponse>> Update(int id, UpdateProjectRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var project = await _db.Projects.FindAsync(id);
        if (project is null)
            return NotFound();

        var workspace = await _db.Workspaces.FindAsync(request.WorkspaceId);
        if (workspace is null)
            return BadRequest(new { message = "Workspace does not exist." });

        if (request.EndDate < request.StartDate)
            return BadRequest(new { message = "EndDate must be after StartDate." });

        project.Title = request.Title;
        project.Description = request.Description;
        project.WorkspaceId = request.WorkspaceId;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;
        project.Budget = request.Budget;
        project.Status = request.Status;

        await _db.SaveChangesAsync();

        return Ok(new ProjectResponse(project.Id, project.Title, project.Description, project.WorkspaceId, project.StartDate, project.EndDate, project.Budget, project.Status));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project is null)
            return NotFound();

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}