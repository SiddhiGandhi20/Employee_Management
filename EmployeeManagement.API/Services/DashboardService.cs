using System.Data;
using Microsoft.Data.SqlClient;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;

namespace EmployeeManagement.API.Services
{
    public class DashboardService
    {
        private readonly DbConnectionFactory _connectionFactory;

        public DashboardService(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }


        // DASHBOARD COUNTS
        public async Task<DashboardSummary>
            GetSummary()
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Dashboard_GetSummary",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
            {
                return new DashboardSummary();
            }

            return new DashboardSummary
            {
                TotalEmployees =
                    Convert.ToInt32(
                        reader["TotalEmployees"]),

                ActiveEmployees =
                    Convert.ToInt32(
                        reader["ActiveEmployees"]),

                InactiveEmployees =
                    Convert.ToInt32(
                        reader["InactiveEmployees"]),

                TotalDepartments =
                    Convert.ToInt32(
                        reader["TotalDepartments"])
            };
        }


        // DEPARTMENT-WISE EMPLOYEE COUNT
        public async Task<List<DepartmentSummary>>
            GetDepartmentSummary()
        {
            var result =
                new List<DepartmentSummary>();

            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Dashboard_GetDepartmentSummary",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                result.Add(new DepartmentSummary
                {
                    DepartmentId =
                        Convert.ToInt32(
                            reader["DepartmentId"]),

                    DepartmentName =
                        reader["DepartmentName"]
                        .ToString()!,

                    EmployeeCount =
                        Convert.ToInt32(
                            reader["EmployeeCount"])
                });
            }

            return result;
        }
    }
}