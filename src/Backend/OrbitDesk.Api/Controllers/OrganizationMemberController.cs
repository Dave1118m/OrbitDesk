using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizationMemberController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrganizationMemberController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrganizationMemberResponse>>> GetAll()
    {
        var members = await _db.OrganizationMembers
            .AsNoTracking()
            .Select(m => new OrganizationMemberResponse(m.OrganizationId, m.UserId, m.Role))
            .ToListAsync();

        return Ok(members);
    }

    [HttpPost]
    public async Task<ActionResult<OrganizationMemberResponse>> Create(CreateOrganizationMemberRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var organization = await _db.Organizations.FindAsync(request.OrganizationId);
        if (organization is null)
            return BadRequest(new { message = "Organization does not exist." });

        var user = await _db.Users.FindAsync(request.UserId);
        if (user is null)
            return BadRequest(new { message = "User does not exist." });

        var exists = await _db.OrganizationMembers.AnyAsync(m => m.OrganizationId == request.OrganizationId && m.UserId == request.UserId);
        if (exists)
            return Conflict(new { message = "User is already a member of the organization." });

        var member = new OrganizationMember
        {
            OrganizationId = request.OrganizationId,
            UserId = request.UserId,
            Role = request.Role
        };

        _db.OrganizationMembers.Add(member);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { organizationId = member.OrganizationId, userId = member.UserId }, new OrganizationMemberResponse(member.OrganizationId, member.UserId, member.Role));
    }

    [HttpDelete]
    public async Task<IActionResult> Remove([FromBody] RemoveOrganizationMemberRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var member = await _db.OrganizationMembers.FindAsync(request.OrganizationId, request.UserId);
        if (member is null)
            return NotFound();

        _db.OrganizationMembers.Remove(member);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}