using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmployeeManagement.API.Services;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(
            DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }


        // GET:
        // api/dashboard/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary =
                await _dashboardService.GetSummary();    //retrives summary data from the service layer.

            return Ok(summary);
        }


        // GET:
        // api/dashboard/departments
        [HttpGet("departments")]
        public async Task<IActionResult>
            GetDepartmentSummary()
        {
            var result =
                await _dashboardService
                    .GetDepartmentSummary();

            return Ok(result);
        }
    }
}