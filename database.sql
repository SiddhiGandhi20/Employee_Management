/*
  EmployeeDB - tables + stored procedures expected by EmployeeManagement.API
  Safe to re-run: creates the DB/tables only if missing, adds missing columns,
  and CREATE OR ALTERs every procedure.
*/
IF DB_ID('EmployeeDB') IS NULL CREATE DATABASE EmployeeDB;
GO
USE EmployeeDB;
GO

/* ===================== TABLES ===================== */
IF OBJECT_ID('dbo.Users') IS NULL
CREATE TABLE dbo.Users (
    UserId       INT IDENTITY(1,1) PRIMARY KEY,
    Username     NVARCHAR(100) NOT NULL UNIQUE,
    Email        NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    Role         NVARCHAR(20)  NOT NULL DEFAULT 'User',
    Status       BIT           NOT NULL DEFAULT 1,
    CreatedAt    DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID('dbo.Departments') IS NULL
CREATE TABLE dbo.Departments (
    DepartmentId   INT IDENTITY(1,1) PRIMARY KEY,
    DepartmentName NVARCHAR(100) NOT NULL,
    Description    NVARCHAR(250) NULL,
    Status         BIT NOT NULL DEFAULT 1
);
GO

IF OBJECT_ID('dbo.Employees') IS NULL
CREATE TABLE dbo.Employees (
    EmployeeId   INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode NVARCHAR(30)  NOT NULL UNIQUE,
    EmployeeName NVARCHAR(100) NOT NULL,
    DepartmentId INT NOT NULL REFERENCES dbo.Departments(DepartmentId),
    Designation  NVARCHAR(100) NOT NULL,
    Email        NVARCHAR(150) NOT NULL,
    MobileNo     NVARCHAR(20)  NOT NULL,
    JoiningDate  DATE NOT NULL,
    Status       BIT  NOT NULL DEFAULT 1
);
GO

/* If an older Users table exists without these columns, add them */
IF COL_LENGTH('dbo.Users', 'Email') IS NULL
    ALTER TABLE dbo.Users ADD Email NVARCHAR(150) NULL;
IF COL_LENGTH('dbo.Users', 'Status') IS NULL
    ALTER TABLE dbo.Users ADD Status BIT NOT NULL CONSTRAINT DF_Users_Status DEFAULT 1;
IF COL_LENGTH('dbo.Users', 'Role') IS NULL
    ALTER TABLE dbo.Users ADD Role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'User';
GO

/* ===================== AUTH ===================== */
CREATE OR ALTER PROCEDURE sp_User_CheckExists
    @Username NVARCHAR(100), @Email NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId FROM Users WHERE Username = @Username OR Email = @Email;
END
GO

CREATE OR ALTER PROCEDURE sp_User_Register
    @Username NVARCHAR(100), @Email NVARCHAR(150),
    @PasswordHash NVARCHAR(200), @Role NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Users (Username, Email, PasswordHash, Role, Status)
    VALUES (@Username, @Email, @PasswordHash, ISNULL(NULLIF(@Role, ''), 'User'), 1);
    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE sp_User_GetByUsername
    @Username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT UserId, Username, Email, PasswordHash, Role, Status
      FROM Users WHERE Username = @Username;
END
GO

/* ===================== DEPARTMENT ===================== */
CREATE OR ALTER PROCEDURE sp_Department_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DepartmentId, DepartmentName, Description, Status
      FROM Departments ORDER BY DepartmentName;
END
GO

CREATE OR ALTER PROCEDURE sp_Department_GetById
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DepartmentId, DepartmentName, Description, Status
      FROM Departments WHERE DepartmentId = @DepartmentId;
END
GO

CREATE OR ALTER PROCEDURE sp_Department_Insert
    @DepartmentName NVARCHAR(100), @Description NVARCHAR(250), @Status BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = @DepartmentName)
        THROW 50001, 'Department name already exists.', 1;

    INSERT INTO Departments (DepartmentName, Description, Status)
    VALUES (@DepartmentName, @Description, @Status);
    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

-- returns rows affected (API treats 0 as "not found")
CREATE OR ALTER PROCEDURE sp_Department_Update
    @DepartmentId INT, @DepartmentName NVARCHAR(100), @Description NVARCHAR(250), @Status BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Departments WHERE DepartmentName = @DepartmentName AND DepartmentId <> @DepartmentId)
        THROW 50001, 'Department name already exists.', 1;

    UPDATE Departments
       SET DepartmentName = @DepartmentName, Description = @Description, Status = @Status
     WHERE DepartmentId = @DepartmentId;
    SELECT @@ROWCOUNT;
END
GO

-- hard delete; blocked while employees still belong to it
CREATE OR ALTER PROCEDURE sp_Department_Delete
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Employees WHERE DepartmentId = @DepartmentId)
        THROW 50003, 'Cannot delete a department that has employees. Delete or move them first.', 1;

    DELETE FROM Departments WHERE DepartmentId = @DepartmentId;
    SELECT @@ROWCOUNT;
END
GO

/* ===================== EMPLOYEE ===================== */
CREATE OR ALTER PROCEDURE sp_Employee_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.EmployeeId, e.EmployeeCode, e.EmployeeName, e.DepartmentId, d.DepartmentName,
           e.Designation, e.Email, e.MobileNo, e.JoiningDate, e.Status
      FROM Employees e
      JOIN Departments d ON d.DepartmentId = e.DepartmentId
     ORDER BY e.EmployeeName;
END
GO

CREATE OR ALTER PROCEDURE sp_Employee_GetById
    @EmployeeId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.EmployeeId, e.EmployeeCode, e.EmployeeName, e.DepartmentId, d.DepartmentName,
           e.Designation, e.Email, e.MobileNo, e.JoiningDate, e.Status
      FROM Employees e
      JOIN Departments d ON d.DepartmentId = e.DepartmentId
     WHERE e.EmployeeId = @EmployeeId;
END
GO

CREATE OR ALTER PROCEDURE sp_Employee_GetByDepartment
    @DepartmentId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.EmployeeId, e.EmployeeCode, e.EmployeeName, e.DepartmentId, d.DepartmentName,
           e.Designation, e.Email, e.MobileNo, e.JoiningDate, e.Status
      FROM Employees e
      JOIN Departments d ON d.DepartmentId = e.DepartmentId
     WHERE e.DepartmentId = @DepartmentId
     ORDER BY e.EmployeeName;
END
GO

CREATE OR ALTER PROCEDURE sp_Employee_Insert
    @EmployeeCode NVARCHAR(30), @EmployeeName NVARCHAR(100), @DepartmentId INT,
    @Designation NVARCHAR(100), @Email NVARCHAR(150), @MobileNo NVARCHAR(20),
    @JoiningDate DATE, @Status BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Employees WHERE EmployeeCode = @EmployeeCode)
        THROW 50002, 'Employee code already exists.', 1;

    INSERT INTO Employees (EmployeeCode, EmployeeName, DepartmentId, Designation, Email, MobileNo, JoiningDate, Status)
    VALUES (@EmployeeCode, @EmployeeName, @DepartmentId, @Designation, @Email, @MobileNo, @JoiningDate, @Status);
    SELECT CAST(SCOPE_IDENTITY() AS INT);
END
GO

CREATE OR ALTER PROCEDURE sp_Employee_Update
    @EmployeeId INT, @EmployeeCode NVARCHAR(30), @EmployeeName NVARCHAR(100), @DepartmentId INT,
    @Designation NVARCHAR(100), @Email NVARCHAR(150), @MobileNo NVARCHAR(20),
    @JoiningDate DATE, @Status BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM Employees WHERE EmployeeCode = @EmployeeCode AND EmployeeId <> @EmployeeId)
        THROW 50002, 'Employee code already exists.', 1;

    UPDATE Employees
       SET EmployeeCode = @EmployeeCode, EmployeeName = @EmployeeName, DepartmentId = @DepartmentId,
           Designation = @Designation, Email = @Email, MobileNo = @MobileNo,
           JoiningDate = @JoiningDate, Status = @Status
     WHERE EmployeeId = @EmployeeId;
    SELECT @@ROWCOUNT;
END
GO

-- hard delete
CREATE OR ALTER PROCEDURE sp_Employee_Delete
    @EmployeeId INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM Employees WHERE EmployeeId = @EmployeeId;
    SELECT @@ROWCOUNT;
END
GO

/* ===================== DASHBOARD ===================== */
CREATE OR ALTER PROCEDURE sp_Dashboard_GetSummary
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        (SELECT COUNT(*) FROM Employees)                  AS TotalEmployees,
        (SELECT COUNT(*) FROM Employees WHERE Status = 1) AS ActiveEmployees,
        (SELECT COUNT(*) FROM Employees WHERE Status = 0) AS InactiveEmployees,
        (SELECT COUNT(*) FROM Departments)                AS TotalDepartments;
END
GO

CREATE OR ALTER PROCEDURE sp_Dashboard_GetDepartmentSummary
AS
BEGIN
    SET NOCOUNT ON;
    SELECT d.DepartmentId, d.DepartmentName, COUNT(e.EmployeeId) AS EmployeeCount
      FROM Departments d
      LEFT JOIN Employees e ON e.DepartmentId = d.DepartmentId
     GROUP BY d.DepartmentId, d.DepartmentName
     ORDER BY d.DepartmentName;
END
GO

/* ===================== REPORT ===================== */
CREATE OR ALTER PROCEDURE sp_Report_EmployeeDepartmentWise
AS
BEGIN
    SET NOCOUNT ON;
    SELECT e.EmployeeId, e.EmployeeCode, e.EmployeeName, e.DepartmentId, d.DepartmentName,
           e.Designation, e.Email, e.MobileNo, e.JoiningDate, e.Status
      FROM Employees e
      JOIN Departments d ON d.DepartmentId = e.DepartmentId
     ORDER BY d.DepartmentName, e.EmployeeName;
END
GO
