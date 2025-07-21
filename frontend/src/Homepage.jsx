import React from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

export default function HomePage({ onLogin, username = 'Guest', onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const userIsGuest = !username || username === 'Guest';

  React.useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  // Intersection observer for section transitions
  React.useEffect(() => {
    const sections = document.querySelectorAll('.homepage-section');
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (!e.target.closest('.navbar-user')) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <div className="homepage-root">
      {/* Navbar */}
      <nav className="homepage-navbar">
        <div className="navbar-logo">TabluaX</div>
        <div className="navbar-links">
          <a href="#home" className="active">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div
          className={`navbar-user${dropdownOpen ? ' show-dropdown' : ''}`}
          tabIndex={0}
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <span style={{marginRight: '0.5rem', fontSize: '1.2rem'}}>👤</span>
          {username || 'Guest'}
          {/* Dropdown */}
          <div className="navbar-user-dropdown">
            {!userIsGuest && (
              <button
                className="navbar-user-dropdown-btn"
                onClick={e => { e.stopPropagation(); setDropdownOpen(false); onLogout && onLogout(); }}
              >
                Logout
              </button>
            )}
            {userIsGuest && (
              <span style={{padding: '0.7rem 1.2rem', color: '#64748b', fontSize: '0.98rem'}}>Not logged in</span>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section (Home) */}
      <section id="home" className="homepage-hero homepage-section">
        <div className="hero-left">
          <div className="hero-badge">
            <span className="hero-badge-dot">🧠</span> AI-Powered Data Transformation
          </div>
          <h1 className="hero-title">
            TabulaX: Smart Data Transformation
          </h1>
          <p className="hero-desc">
            Effortlessly transform, automate, and integrate your data workflows.<br />
            Upload CSVs, learn transformations with AI, and connect to MySQL or MongoDB—all in one seamless platform.<br />
            <span style={{color:'#2563eb', fontWeight:600}}>No coding required.</span> Empower your business with data-driven decisions and automation.
          </p>
          <ul style={{margin:'1.2rem 0 1.5rem 1.2rem', color:'#64748b', fontSize:'1.08rem'}}>
            <li>✔️ Intuitive drag-and-drop interface</li>
            <li>✔️ Visual data previews and step-by-step guidance</li>
            <li>✔️ Secure, privacy-first design</li>
          </ul>
          <div className="hero-actions">
            <button className="hero-getstarted" onClick={onLogin}>Get Started</button>
          </div>
        </div>
        <div className="hero-right">
          <img
            src="/tabulax.jpg"
            alt="TabulaX platform illustration"
            className="hero-illustration"
            style={{maxWidth:'420px', width:'100%', borderRadius:'18px', boxShadow:'0 2px 16px rgba(30,41,59,0.08)'}}
          />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="homepage-section">
        <h2 className="section-title">About TabulaX</h2>
        <p className="section-desc">TabulaX is an AI-powered data transformation platform that helps you automate, classify, and transform your data with ease. Our mission is to make data workflows seamless and intelligent for everyone.</p>
        <div style={{marginTop:'1.2rem', color:'#475569', fontSize:'1.08rem', lineHeight:'1.7'}}>
          <p>Whether you're a data analyst, business owner, or developer, TabulaX provides the tools you need to:</p>
          <ul style={{marginLeft:'1.2rem'}}>
            <li>• Clean and standardize messy datasets in seconds</li>
            <li>• Learn and apply complex transformations with AI assistance</li>
            <li>• Integrate seamlessly with your existing MySQL and MongoDB databases</li>
            <li>• Collaborate and share transformation logic with your team</li>
          </ul>
          <p style={{marginTop:'1rem'}}>TabulaX is built for flexibility, security, and ease of use—so you can focus on insights, not infrastructure.</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="homepage-section">
        <h2 className="section-title">Features</h2>
        <ul className="features-list">
          <li>⚡ <b>Drag-and-drop CSV upload and preview:</b> Instantly see your data and select columns for transformation.</li>
          <li>🤖 <b>AI-powered transformation learning:</b> Let our AI suggest and generate transformation functions based on your examples.</li>
          <li>🔗 <b>MySQL and MongoDB integration:</b> Connect, preview, and update your database tables and collections directly.</li>
          <li>📊 <b>Real-time data preview and download:</b> See the results before you commit, and export transformed data with one click.</li>
          <li>🔒 <b>Secure authentication and user management:</b> Your data and logic are protected with modern security best practices.</li>
          <li>📝 <b>Transformation history:</b> Track, review, and reuse your past transformations for maximum productivity.</li>
          <li>🌐 <b>Cloud-ready and scalable:</b> Designed to grow with your business and handle large datasets.</li>
        </ul>
      </section>

      {/* Services Section */}
      <section id="services" className="homepage-section">
        <h2 className="section-title">Our Services</h2>
        <div className="services-list">
          <div className="service-card">
            <h3>Data Transformation</h3>
            <p>Automate and customize your data transformation workflows using advanced AI models. From simple formatting to complex logic, TabulaX adapts to your needs.</p>
            <ul style={{marginLeft:'1.2rem', color:'#64748b'}}>
              <li>• String, numeric, and algorithmic transformations</li>
              <li>• Example-driven function generation</li>
              <li>• Batch and real-time processing</li>
            </ul>
          </div>
          <div className="service-card">
            <h3>Database Integration</h3>
            <p>Seamlessly connect and sync your data with MySQL and MongoDB databases. Preview, transform, and update tables or collections—all from one interface.</p>
            <ul style={{marginLeft:'1.2rem', color:'#64748b'}}>
              <li>• Safe, non-destructive updates</li>
              <li>• Data previews before commit</li>
              <li>• Support for large tables and collections</li>
            </ul>
          </div>
          <div className="service-card">
            <h3>Custom Automation</h3>
            <p>Set up rules and triggers to automate repetitive data tasks and reporting. Integrate with your workflow tools and APIs for end-to-end automation.</p>
            <ul style={{marginLeft:'1.2rem', color:'#64748b'}}>
              <li>• Scheduled transformations</li>
              <li>• Webhook/API integration</li>
              <li>• Custom notification rules</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="homepage-section">
        <h2 className="section-title">Pricing</h2>
        <div className="pricing-table">
          <div className="pricing-card">
            <h3>Free</h3>
            <p className="price">$0/mo</p>
            <ul>
              <li>Basic transformations</li>
              <li>CSV upload</li>
              <li>Community support</li>
              <li>Up to 1000 rows per transformation</li>
            </ul>
          </div>
          <div className="pricing-card">
            <h3>Pro</h3>
            <p className="price">$19/mo</p>
            <ul>
              <li>All Free features</li>
              <li>Database integration</li>
              <li>Priority support</li>
              <li>Unlimited rows</li>
              <li>Transformation history</li>
            </ul>
          </div>
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <p className="price">Contact Us</p>
            <ul>
              <li>Custom solutions</li>
              <li>Dedicated support</li>
              <li>On-premise deployment</li>
              <li>Advanced security & compliance</li>
              <li>Team collaboration features</li>
            </ul>
          </div>
        </div>
        <div style={{marginTop:'1.5rem', color:'#475569', fontSize:'1.08rem'}}>
          <p>Not sure which plan is right for you? <b>Contact us</b> for a personalized demo or to discuss your requirements.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="homepage-section">
        <h2 className="section-title">Contact Us</h2>
        <form className="contact-form">
          <input type="text" placeholder="Your Name" className="contact-input" />
          <input type="email" placeholder="Your Email" className="contact-input" />
          <textarea placeholder="Your Message" className="contact-textarea" rows={4}></textarea>
          <button type="submit" className="contact-submit">Send Message</button>
        </form>
        <div className="contact-info" style={{marginTop:'1.2rem', color:'#475569', fontSize:'1.08rem'}}>
          <p><b>Email:</b> support@tabulax.com</p>
          <p><b>Phone:</b> +1 234 567 8901</p>
          <p><b>Address:</b> 123 Data Lane, AI City, 12345</p>
          <p style={{marginTop:'1rem'}}>Follow us on social media for updates, tips, and community stories:</p>
          <div style={{display:'flex', gap:'1.2rem', marginTop:'0.5rem'}}>
            <a href="#" style={{color:'#2563eb', textDecoration:'none', fontWeight:600}}>Twitter</a>
            <a href="#" style={{color:'#2563eb', textDecoration:'none', fontWeight:600}}>LinkedIn</a>
            <a href="#" style={{color:'#2563eb', textDecoration:'none', fontWeight:600}}>GitHub</a>
          </div>
        </div>
      </section>
    </div>
  );
}
