import "./AboutSection.css";

export default function AboutSection() {
  return (
    <section id="about" className="about-section">
      <h2 className="about-title">About Smart E-Waste</h2>

      <p className="about-desc">
        At Smart E-Waste, we make recycling electronics easy and safe. 
        Old phones, laptops, batteries, or gadgets? We help you dispose of them responsibly,
        keeping our planet cleaner and greener.
      </p>

      <div className="about-grid">
        <div className="about-card">
          <h4>What We Handle</h4>
          <p>
            From phones to laptops, batteries to chargers – we accept a wide range of electronics for proper recycling.
          </p>
        </div>

        <div className="about-card">
          <h4>Why It Matters</h4>
          <p>
            E-waste can harm our health and environment if not recycled. We ensure safe disposal to reduce pollution.
          </p>
        </div>

        <div className="about-card">
          <h4>Our Approach</h4>
          <p>
            We provide doorstep pickup, certified recycling partners, and updates to keep you informed.
          </p>
        </div>

        <div className="about-card">
          <h4>Your Impact</h4>
          <p>
            Every item you recycle saves resources, reduces waste, and helps build a sustainable future.
          </p>
        </div>
      </div>
    </section>
  );
}
