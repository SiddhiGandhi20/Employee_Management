using Microsoft.AspNetCore.Mvc;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Services;

namespace EmployeeManagement.API.Controllers
{
    [ApiController]                                       
    [Route("api/[controller]")]                          
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;        

        public AuthController(AuthService authService)    
        {
            _authService = authService;                  
        }


        // POST: api/auth/login
        [HttpPost("login")]                              // defines the route for the login endpoint, which is api/auth/login
        public async Task<IActionResult> Login(        
            LoginRequest request)                       
        {
            try
            {
                var token =
                    await _authService.Login(request);

                if (token == null)
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid username or password."
                    });
                }

                return Ok(new
                {
                    message = "Login successful.",
                    token = token
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


        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(
            RegisterRequest request)
        {
            try
            {
                var userId =
                    await _authService.Register(request);

                return Ok(new
                {
                    message =
                        "User registered successfully.",

                    userId = userId
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