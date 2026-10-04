using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.API.Controllers
{
[ApiController]
[Route("api/departments")]
[Authorize]
public class DepartmentsController : ControllerBase
{
private readonly DepartmentService _departmentService;



    public DepartmentsController(
        DepartmentService departmentService)
    {
        _departmentService = departmentService;
    }


    // GET: api/departments
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departments =
            await _departmentService.GetAll();

        return Ok(departments);
    }


    // GET: api/departments/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var department =
            await _departmentService.GetById(id);

        if (department == null)
        {
            return NotFound(new
            {
                message = "Department not found."
            });
        }

        return Ok(department);
    }


    // POST: api/departments
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        DepartmentRequest request)
    {
        try
        {
            var id =
                await _departmentService.Create(request);

            return Ok(new
            {
                message = "Department created successfully.",
                departmentId = id
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // PUT: api/departments/1
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        DepartmentRequest request)
    {
        try
        {
            var success =
                await _departmentService.Update(
                    id,
                    request);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Department not found."
                });
            }

            return Ok(new
            {
                message = "Department updated successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // DELETE: api/departments/1
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success =
                await _departmentService.Delete(id);

            if (!success)
            {
                return NotFound(new
                {
                    message = "Department not found."
                });
            }

            return Ok(new
            {
                message = "Department deleted successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}

}
