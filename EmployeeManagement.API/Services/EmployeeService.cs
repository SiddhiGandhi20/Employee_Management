using System.Data;
using Microsoft.Data.SqlClient;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;


namespace EmployeeManagement.API.Services
{
    public class EmployeeService
    {
        private readonly DbConnectionFactory _connectionFactory;

        public EmployeeService(
            DbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }


        // GET ALL EMPLOYEES
        public async Task<List<Employee>>
            GetAll()
        {
            var employees =
                new List<Employee>();

            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Employee_GetAll",     //command for stored procedure execution.
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;           //command type is set to stored procedure.

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();  //expects rows from data

            while (await reader.ReadAsync())
            {                                            //loops through the rows and maps each row to an Employee object
                employees.Add(MapEmployee(reader));       //converts the SQL row into an Employee
            }                                              //returnns complete list of employees.

            return employees;
        }


        // GET EMPLOYEE BY ID
        public async Task<Employee?>
            GetById(int id)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Employee_GetById",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;        //stored procedure is executed to get employee by ID.

            command.Parameters.AddWithValue(
                "@EmployeeId",
                id);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();     //executes the stored procedure and returns a reader to read the result set.

            if (!await reader.ReadAsync())
                return null;                          //if no id is found it returns null.

            return MapEmployee(reader);
        }


        // GET EMPLOYEES BY DEPARTMENT
        public async Task<List<Employee>>
            GetByDepartment(int departmentId)
        {
            var employees =
                new List<Employee>();

            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Employee_GetByDepartment",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@DepartmentId",
                departmentId);

            await connection.OpenAsync();

            using var reader =
                await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                employees.Add(MapEmployee(reader));
            }

            return employees;
        }


        // CREATE
        public async Task<int> Create(
            EmployeeRequest request)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Employee_Insert",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;     //command type is set to stored procedure.

            AddEmployeeParameters(              //adds the parameters to the command object for the stored procedure execution.
                command,
                request);                

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result);       //returns the newly created employee's ID.
        }


        // UPDATE
        public async Task<bool> Update(
            int id,
            EmployeeRequest request)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(
                    "sp_Employee_Update",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@EmployeeId",
                id);

            AddEmployeeParameters(
                command,
                request);

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result) > 0;  //returns true if the update was successful, false otherwise.
        }


        // DELETE / DEACTIVATE
        public async Task<bool> Delete(int id)
        {
            using var connection =
                _connectionFactory.CreateConnection();

            using var command =
                new SqlCommand(                     //command for stored procedure execution to delete an employee.
                    "sp_Employee_Delete",
                    connection);

            command.CommandType =
                CommandType.StoredProcedure;

            command.Parameters.AddWithValue(
                "@EmployeeId",                 //parameter for the stored procedure to identify which employee to delete.
                id);                                       

            await connection.OpenAsync();

            var result =
                await command.ExecuteScalarAsync();

            return Convert.ToInt32(result) > 0;  //returns true if the deletion was successful, false otherwise.
        }


        // COMMON PARAMETER METHOD
        private void AddEmployeeParameters(
            SqlCommand command,
            EmployeeRequest request)
        {
            command.Parameters.AddWithValue(
                "@EmployeeCode",
                request.EmployeeCode);

            command.Parameters.AddWithValue(
                "@EmployeeName",
                request.EmployeeName);

            command.Parameters.AddWithValue(
                "@DepartmentId",
                request.DepartmentId);

            command.Parameters.AddWithValue(
                "@Designation",
                request.Designation);

            command.Parameters.AddWithValue(
                "@Email",
                request.Email);

            command.Parameters.AddWithValue(
                "@MobileNo",
                request.MobileNo);

            command.Parameters.AddWithValue(
                "@JoiningDate",
                request.JoiningDate);

            command.Parameters.AddWithValue(
                "@Status",
                request.Status);
        }


        // MAP SQL DATA TO EMPLOYEE OBJECT
        private Employee MapEmployee(
            SqlDataReader reader)
        {
            return new Employee
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
            };
        }
    }
}