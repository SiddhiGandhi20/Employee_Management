using System.Data;          //executing a stored procedure, not a normal SQL query.
using Microsoft.Data.SqlClient;      //connection-related functionality
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Helpers;      //responsible for generating the JWT token.
using EmployeeManagement.API.Models;

namespace EmployeeManagement.API.Services
{
    public class AuthService
    {
        private readonly DbConnectionFactory _connectionFactory;   //Used to create SQL Server connections.
        private readonly JwtHelper _jwtHelper;                     //generate JWT tokens. both injected by the constructor.

        public AuthService(
            DbConnectionFactory connectionFactory,             
            JwtHelper jwtHelper)
        {                                    //I used constructor dependency injection to provide DbConnectionFactory and JwtHelper to AuthService.
            _connectionFactory = connectionFactory;
            _jwtHelper = jwtHelper;
        }

        // LOGIN
        public async Task<string?> Login(LoginRequest request)
        {
            using var connection =
                _connectionFactory.CreateConnection();         //database connection is created using the DbConnectionFactory.

            using var command = new SqlCommand(      //to execute stored procedures.
                "sp_User_GetByUsername",
                connection);

            command.CommandType =
                CommandType.StoredProcedure;          //"The command text is the name of a stored procedure."

            command.Parameters.AddWithValue(
                "@Username",
                request.Username);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();        //returns the result from the stored procedure execution.

            if (!await reader.ReadAsync())
                return null;

            var user = new User
            {
                UserId = Convert.ToInt32(  //database value converted to int.
                    reader["UserId"]),

                Username =
                    reader["Username"].ToString()!,

                Email =
                    reader["Email"].ToString()!,

                PasswordHash =
                    reader["PasswordHash"].ToString()!,

                Role =
                    reader["Role"].ToString()!,

                Status =
                    Convert.ToBoolean(
                        reader["Status"])
            };

            // Check whether user is active
            if (!user.Status)
                return null;  //if user not active, loginn is rejected and null is returned.

            // Verify password
            bool passwordValid =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash);

            if (!passwordValid)
                return null;

            // Generate JWT
            return _jwtHelper.GenerateToken(user);
        }


        // REGISTER
        public async Task<int> Register(
            RegisterRequest request)
        {
            // Check if username/email already exists
            using var checkConnection =                             //db connection created
                _connectionFactory.CreateConnection();

            using var checkCommand =
                new SqlCommand(
                    "sp_User_CheckExists",
                    checkConnection);

            checkCommand.CommandType =
                CommandType.StoredProcedure;

            checkCommand.Parameters.AddWithValue(
                "@Username",
                request.Username);

            checkCommand.Parameters.AddWithValue(
                "@Email",
                request.Email);

            await checkConnection.OpenAsync();

            using var reader =                                 //checks if duplicates exist, stored procedure runs.
                await checkCommand.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                throw new Exception(
                    "Username or Email already exists.");
            }

            await reader.DisposeAsync();
            await checkConnection.CloseAsync();


            // Hash password
            string passwordHash =
                BCrypt.Net.BCrypt.HashPassword(          //plain password becomes hashed password.
                    request.Password);


            // Insert user
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_User_Register",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@Username",
                request.Username);

            command.Parameters.AddWithValue(
                "@Email",
                request.Email);

            command.Parameters.AddWithValue(
                "@PasswordHash",
                passwordHash);

            command.Parameters.AddWithValue(
                "@Role",
                request.Role);

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);
        }
    }
}