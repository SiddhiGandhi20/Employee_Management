using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using EmployeeManagement.API.Data;
using EmployeeManagement.API.Helpers;
using EmployeeManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);


// Controllers
builder.Services.AddControllers();


// Database
builder.Services.AddScoped<DbConnectionFactory>();


// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<ReportService>();


// JWT Helper
builder.Services.AddScoped<JwtHelper>();


// JWT Authentication
var jwtKey =
    builder.Configuration["Jwt:Key"]!;

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]!;

var jwtAudience =
    builder.Configuration["Jwt:Audience"]!;

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,

                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey))
            };
    });


// Authorization
builder.Services.AddAuthorization();


// CORS for React
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();