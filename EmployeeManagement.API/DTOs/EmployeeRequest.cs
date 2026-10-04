namespace EmployeeManagement.API.DTOs
{
    public class EmployeeRequest
    {
        public string EmployeeCode { get; set; } = string.Empty;

        public string EmployeeName { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public string Designation { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string MobileNo { get; set; } = string.Empty;

        public DateTime JoiningDate { get; set; }

        public bool Status { get; set; }
    }
}