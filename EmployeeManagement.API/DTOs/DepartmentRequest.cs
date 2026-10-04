namespace EmployeeManagement.API.DTOs
{
    public class DepartmentRequest
    {
        public string DepartmentName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool Status { get; set; }
    }
}