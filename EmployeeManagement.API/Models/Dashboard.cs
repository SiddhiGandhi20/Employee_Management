namespace EmployeeManagement.API.Models
{
    public class DashboardSummary
    {
        public int TotalEmployees { get; set; }

        public int ActiveEmployees { get; set; }

        public int InactiveEmployees { get; set; }

        public int TotalDepartments { get; set; }
    }


    public class DepartmentSummary
    {
        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; }
            = string.Empty;

        public int EmployeeCount { get; set; }
    }
}