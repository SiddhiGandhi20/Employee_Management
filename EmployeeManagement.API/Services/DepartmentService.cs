using System.Data;
using Microsoft.Data.SqlClient;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;

namespace EmployeeManagement.API.Services
{
    public class DepartmentService
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DepartmentService(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }


        // GET ALL
        public async Task<List<Department>>
            GetAll()
        {
            var departments =
                new List<Department>();

            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Department_GetAll", 
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())   //loops through the rows and maps each row to a Department object
            {
                departments.Add(new Department
                {
                    DepartmentId =
                        Convert.ToInt32(
                            reader["DepartmentId"]),

                    DepartmentName =
                        reader["DepartmentName"]
                        .ToString()!,

                    Description =
                        reader["Description"] == DBNull.Value //if the value is null in the database, it returns null in C#.
                        ? null
                        : reader["Description"].ToString(),

                    Status =
                        Convert.ToBoolean(
                            reader["Status"])
                });
            }

            return departments;
        }


        // GET BY ID
        public async Task<Department?>
            GetById(int id)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Department_GetById",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@DepartmentId",
                id);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return new Department
            {
                DepartmentId =
                    Convert.ToInt32(
                        reader["DepartmentId"]),

                DepartmentName =
                    reader["DepartmentName"]
                    .ToString()!,

                Description =
                    reader["Description"] == DBNull.Value
                    ? null
                    : reader["Description"].ToString(),

                Status =
                    Convert.ToBoolean(
                        reader["Status"])
            };
        }


        // INSERT
        public async Task<int> Create(
            DepartmentRequest request)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Department_Insert",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@DepartmentName",
                request.DepartmentName);

            command.Parameters.AddWithValue(
                "@Description",
                request.Description ?? "");

            command.Parameters.AddWithValue(
                "@Status",
                request.Status);

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);
        }


        // UPDATE
        public async Task<bool> Update(
            int id,
            DepartmentRequest request)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Department_Update",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@DepartmentId",
                id);

            command.Parameters.AddWithValue(
                "@DepartmentName",
                request.DepartmentName);

            command.Parameters.AddWithValue(
                "@Description",
                request.Description ?? "");

            command.Parameters.AddWithValue(
                "@Status",
                request.Status);

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result) > 0;
        }


        // DELETE / DEACTIVATE
        public async Task<bool> Delete(int id)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Department_Delete",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@DepartmentId",
                id);

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result) > 0;
        }
    }
}