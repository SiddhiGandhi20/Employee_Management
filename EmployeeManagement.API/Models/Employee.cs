namespace EmployeeManagement.API.Models
{
public class Employee
{
public int EmployeeId { get; set; }

    public string EmployeeCode { get; set; } = "";

    public string EmployeeName { get; set; } = "";

    public int DepartmentId { get; set; }

    public string? DepartmentName { get; set; }

    public string? Designation { get; set; }

    public string? Email { get; set; }

    public string? MobileNo { get; set; }

    public DateTime JoiningDate { get; set; }

    public bool Status { get; set; }
}

}
