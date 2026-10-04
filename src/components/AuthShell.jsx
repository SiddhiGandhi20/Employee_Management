import Icon from './Icon';

// Split-screen frame shared by Login and Register
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="brand">
          <span className="brand-logo"><Icon name="users" size={18} /></span>
          <div>EmpManager<small>Employee Management</small></div>
        </div>
        <div>
          <h1>Manage your workforce in one place.</h1>
          <ul className="features">
            <li><Icon name="building" /> Department &amp; employee master</li>
            <li><Icon name="chart" /> Live dashboard with drill-down</li>
            <li><Icon name="report" /> Department-wise printable report</li>
            <li><Icon name="lock" /> Secure JWT login with roles</li>
          </ul>
        </div>
        <small className="muted-light">ASP.NET Core · SQL Server · React</small>
      </section>

      <section className="auth-form">
        <div className="auth-box">
          <h2>{title}</h2>
          <p className="sub">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
