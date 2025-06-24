import React from 'react';
import './style.css'; // Make sure your CSS file path is correct

const DashboardLayout = ({ children, onNavClick }) => {
  return (
    <div>
      {/* Sidebar */}
      <div className="sidebar">
        <a href="#" className="logo">
          <i className='bx bx-code-alt'></i>
          <div className="logo-name"><span>MO</span>RT</div>
        </a>
        <ul className="side-menu">
          <li><a onClick={() => onNavClick('home')}><i className='bx bxs-dashboard'></i>Home</a></li>
          <li><a onClick={() => onNavClick('notes')}><i className='bx bx-store-alt'></i>Notes</a></li>
          <li><a onClick={() => onNavClick('summarizer')}><i className='bx bx-analyse'></i>Summarizer</a></li>
          <li><a onClick={() => onNavClick('todo')}><i className='bx bx-message-square-dots'></i>TO-DO List</a></li>
          <li><a onClick={() => onNavClick('pdf')}><i className='bx bx-group'></i>PDF Extractor</a></li>
          <li><a onClick={() => onNavClick('settings')}><i className='bx bx-cog'></i>Settings</a></li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="#" className="logout">
              <i className='bx bx-log-out-circle'></i>
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <nav>
          <i className='bx bx-menu'></i>
          <form>
            <div className="form-input">
              <input type="search" placeholder="Search..." />
              <button className="search-btn" type="submit"><i className='bx bx-search'></i></button>
            </div>
          </form>
          <input type="checkbox" id="theme-toggle" hidden />
          <label htmlFor="theme-toggle" className="theme-toggle"></label>
          <a href="#" className="notif">
            <i className='bx bx-bell'></i>
            <span className="count">12</span>
          </a>
          <a href="#" className="profile">
            <img src="images/logo.png" alt="profile" />
          </a>
        </nav>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
