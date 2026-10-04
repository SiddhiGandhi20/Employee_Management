using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EmployeeManagement.API.Services;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly ReportService _reportService;

        public ReportController(
            ReportService reportService)
        {
            _reportService = reportService;
        }


        // GET:
        // api/report/employees
        [HttpGet("employees")]
        public async Task<IActionResult>
            GetEmployeeReport()
        {
            var report =
                await _reportService
                    .GetEmployeeReport();

            return Ok(report);
        }
    }
}