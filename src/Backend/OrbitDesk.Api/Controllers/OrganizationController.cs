using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrbitDesk.Api.Data;
using OrbitDesk.Api.Dto;
using OrbitDesk.Api.Models;

namespace OrbitDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizationController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrganizationController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrganizationResponse>>> GetAll()
    {
        var organizations = await _db.Organizations
            .AsNoTracking()
            .Select(o => new OrganizationResponse(o.Id, o.Name, o.Description, o.Country, o.RegistrationNumber, o.OwnerId))
            .ToListAsync();

        return Ok(organizations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrganizationResponse>> Get(int id)
    {
        var organization = await _db.Organizations
            .AsNoTracking()
            .Where(o => o.Id == id)
            .Select(o => new OrganizationResponse(o.Id, o.Name, o.Description, o.Country, o.RegistrationNumber, o.OwnerId))
            .FirstOrDefaultAsync();

        return organization is null ? NotFound() : Ok(organization);
    }

    [HttpPost]
    public async Task<ActionResult<OrganizationResponse>> Create(CreateOrganizationRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var owner = await _db.Users.FindAsync(request.OwnerId);
        if (owner is null)
            return BadRequest(new { message = "Organization owner does not exist." });

        var organization = new Organization
        {
            Name = request.Name,
            Description = request.Description,
            Country = request.Country,
            RegistrationNumber = request.RegistrationNumber,
            OwnerId = request.OwnerId
        };

        _db.Organizations.Add(organization);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { id = organization.Id }, new OrganizationResponse(organization.Id, organization.Name, organization.Description, organization.Country, organization.RegistrationNumber, organization.OwnerId));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrganizationResponse>> Update(int id, UpdateOrganizationRequest request)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var organization = await _db.Organizations.FindAsync(id);
        if (organization is null)
            return NotFound();

        var owner = await _db.Users.FindAsync(request.OwnerId);
        if (owner is null)
            return BadRequest(new { message = "Organization owner does not exist." });

        organization.Name = request.Name;
        organization.Description = request.Description;
        organization.Country = request.Country;
        organization.RegistrationNumber = request.RegistrationNumber;
        organization.OwnerId = request.OwnerId;

        await _db.SaveChangesAsync();

        return Ok(new OrganizationResponse(organization.Id, organization.Name, organization.Description, organization.Country, organization.RegistrationNumber, organization.OwnerId));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var organization = await _db.Organizations.FindAsync(id);
        if (organization is null)
            return NotFound();

        _db.Organizations.Remove(organization);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
