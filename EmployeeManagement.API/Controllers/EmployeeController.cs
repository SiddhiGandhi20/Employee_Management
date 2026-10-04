using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Services;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]         //applies to all endpoints inside the controller by default.
    public class EmployeeController : ControllerBase
    {
        private readonly EmployeeService _employeeService;

        public EmployeeController(
            EmployeeService employeeService)
        {
            _employeeService = employeeService;
        }


        // GET: api/employee
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var employees =
                await _employeeService.GetAll();

            return Ok(employees);
        }


        // GET: api/employee/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var employee =
                await _employeeService.GetById(id);

            if (employee == null)
            {
                return NotFound(new
                {
                    message =
                        "Employee not found."
                });
            }

            return Ok(employee);
        }


        // GET:
        // api/employee/department/1
        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult>
            GetByDepartment(int departmentId)
        {
            var employees =
                await _employeeService
                    .GetByDepartment(departmentId);

            return Ok(employees);
        }


        // POST: api/employee
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            EmployeeRequest request)
        {
            try
            {
                var id =
                    await _employeeService.Create(
                        request);

                return Ok(new
                {
                    message =
                        "Employee created successfully.",

                    employeeId = id
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


        // PUT: api/employee/1
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(
            int id,
            EmployeeRequest request)
        {
            try
            {
                var success =
                    await _employeeService.Update(
                        id,
                        request);

                if (!success)
                {
                    return NotFound(new
                    {
                        message =
                            "Employee not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Employee updated successfully."
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


        // DELETE: api/employee/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(
            int id)
        {
            try
            {
                var success =
                    await _employeeService.Delete(id);

                if (!success)
                {
                    return NotFound(new
                    {
                        message =
                            "Employee not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Employee deleted successfully."
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