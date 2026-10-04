using System.Data;
using Microsoft.Data.SqlClient;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.Models;

namespace EmployeeManagement.API.Services
{
    public class ReportService
    {
        private readonly DbConnectionFactory _connectionFactory;

        public ReportService(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }


        // DEPARTMENT-WISE EMPLOYEE REPORT
        public async Task<List<Employee>>
            GetEmployeeReport()
        {
            var employees =
                new List<Employee>();

            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Report_EmployeeDepartmentWise",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                employees.Add(new Employee
                {
                    EmployeeId =
                        Convert.ToInt32(
                            reader["EmployeeId"]),

                    EmployeeCode =
                        reader["EmployeeCode"]
                        .ToString()!,

                    EmployeeName =
                        reader["EmployeeName"]
                        .ToString()!,

                    DepartmentId =
                        Convert.ToInt32(
                            reader["DepartmentId"]),

                    DepartmentName =
                        reader["DepartmentName"]
                        .ToString()!,

                    Designation =
                        reader["Designation"]
                        .ToString()!,

                    Email =
                        reader["Email"]
                        .ToString()!,

                    MobileNo =
                        reader["MobileNo"]
                        .ToString()!,

                    JoiningDate =
                        Convert.ToDateTime(
                            reader["JoiningDate"]),

                    Status = 
                        Convert.ToBoolean(
                            reader["Status"])
                });
            }

            return employees;
        }
    }
}