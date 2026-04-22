export const SAMPLE_HTML = `
<header class="site-header">
  <div class="header-inner">
    <span class="site-name">MyWebsite</span>
    <nav class="site-nav">
      <a href="#features">Features</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </div>
</header>

<section class="hero">
  <h1>Build Something Amazing</h1>
  <p class="hero-subtitle">A simple, mobile-friendly website template to get you started. Drag, drop, and customize to make it your own.</p>
  <a href="#features" class="cta-button">Explore Features</a>
</section>

<section id="features" class="features">
  <h2>Features</h2>
  <div class="features-grid">
    <div class="feature-card">
      <h3>Responsive Design</h3>
      <p>Looks great on any device — phone, tablet, or desktop. Built with flexible layouts that adapt to any screen size.</p>
    </div>
    <div class="feature-card">
      <h3>Easy to Customize</h3>
      <p>Change colors, text, and layout with the visual editor. No coding required to make this template your own.</p>
    </div>
    <div class="feature-card">
      <h3>Fast & Lightweight</h3>
      <p>Clean HTML and CSS with no unnecessary dependencies. Your site loads quickly and runs smoothly.</p>
    </div>
  </div>
</section>

<section id="about" class="about">
  <h2>About Us</h2>
  <p>We believe great websites should be accessible to everyone. This template demonstrates what you can build with GrapesJS and a little creativity. Edit any element on this page — change the text, rearrange sections, or add your own components from the block panel.</p>
</section>

<footer id="contact" class="site-footer">
  <div class="footer-inner">
    <p>&copy; 2026 MyWebsite. All rights reserved.</p>
    <nav class="footer-nav">
      <a href="#features">Features</a>
      <a href="#about">About</a>
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
    </nav>
  </div>
</footer>
`;

export const SAMPLE_CSS = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
  line-height: 1.6;
}

.site-header {
  background: #1a1a2e;
  color: #fff;
  padding: 16px 24px;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.site-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.site-nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.site-nav a {
  color: #ccc;
  text-decoration: none;
  font-size: 14px;
}

.site-nav a:hover {
  color: #fff;
}

.hero {
  background: linear-gradient(135deg, #16213e, #0f3460);
  color: #fff;
  text-align: center;
  padding: 80px 24px;
}

.hero h1 {
  font-size: 40px;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 18px;
  color: #b8c6db;
  max-width: 560px;
  margin: 0 auto 32px;
}

.cta-button {
  display: inline-block;
  background: #e94560;
  color: #fff;
  padding: 14px 32px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

.cta-button:hover {
  background: #c73e54;
}

.features {
  padding: 64px 24px;
  max-width: 960px;
  margin: 0 auto;
}

.features h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 32px 24px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #1a1a2e;
}

.feature-card p {
  font-size: 14px;
  color: #666;
}

.about {
  background: #f0f4f8;
  padding: 64px 24px;
}

.about h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 24px;
}

.about p {
  max-width: 640px;
  margin: 0 auto;
  font-size: 16px;
  color: #555;
}

.site-footer {
  background: #1a1a2e;
  color: #999;
  padding: 32px 24px;
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-inner p {
  font-size: 13px;
}

.footer-nav {
  display: flex;
  gap: 16px;
}

.footer-nav a {
  color: #999;
  text-decoration: none;
  font-size: 13px;
}

.footer-nav a:hover {
  color: #fff;
}

@media (max-width: 600px) {
  .hero h1 {
    font-size: 28px;
  }
  .hero-subtitle {
    font-size: 15px;
  }
  .hero {
    padding: 48px 20px;
  }
  .features, .about {
    padding: 40px 20px;
  }
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
`;
