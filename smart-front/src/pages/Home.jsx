import { Link } from "react-router-dom";
import Steps from "../components/Steps";
import AboutSection from "../components/AboutSection";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">

      {/* ---------- MARQUEE ---------- */}
      <div className="marquee text-center mb-4">
        <p className="marquee-text">
          ♻️ Let's protect our planet! Reduce • Reuse • Recycle &nbsp; | &nbsp;
          🔋 E-Waste harms soil & water — dispose responsibly &nbsp; | &nbsp;
          🖥️ Smart E-Waste: Safe Pickup • Data Wipe • Certified Recycling
        </p>
      </div>

      {/* ---------- HERO SECTION ---------- */}
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">Smart E-Waste Recycling</h1>
          <p className="hero-subtitle">
            Dispose your electronic waste safely with certified recycling —
            for a cleaner, greener and smarter future.
          </p>
          <Link to="/register" className="hero-btn">
            Get Started ➜
          </Link>
        </div>

        <div className="hero-right">
          <div className="hero-image-circle">
            <img
              src="https://assets.techrepublic.com/uploads/2023/07/tr71823-ewaste-au.jpeg"
              className="hero-image"
              alt="E-waste"
            />
          </div>
        </div>
      </div>

      {/* ---------- E-WASTE CATEGORY HEADING ---------- */}
      <h2 className="ewaste-title">E-Waste Categories</h2>

      {/* ---------- ROW 1 ---------- */}
      <div className="ewaste-grid">
        <div className="ew-card">
          <img className="ew-card-img" src="https://www.ecowatch.com/wp-content/uploads/2022/11/GettyImages-866313382-scaled.jpg" alt="Phones" />
          <h5 className="ew-card-title">Phones</h5>
        </div>

        <div className="ew-card">
          <img className="ew-card-img" src="https://www.shredwell-recycling.com/wp-content/uploads/2018/09/scrap-computer-keyboard-600x384.jpg" alt="Keyboards" />
          <h5 className="ew-card-title">Keyboards</h5>
        </div>

        <div className="ew-card">
          <img className="ew-card-img" src="https://pirg.org/edfund/wp-content/uploads/2022/07/shutterstock_1675847923-1024x576.jpg" alt="Batteries" />
          <h5 className="ew-card-title">Batteries</h5>
        </div>

        <div className="ew-card">
          <img className="ew-card-img" src="https://www.maketecheasier.com/assets/uploads/2017/12/old-console-donate.jpg" alt="Game Consoles" />
          <h5 className="ew-card-title">Game Consoles</h5>
        </div>
      </div>

      {/* ---------- ROW 2 ---------- */}
      <div className="ewaste-grid">
        <div className="ew-card">
          <img className="ew-card-img" src="https://img.freepik.com/premium-photo/old-electronic-devices-televisions-e-waste-recycling-concept_878453-6599.jpg?w=2000" alt="Televisions" />
          <h5 className="ew-card-title">Televisions</h5>
        </div>

        <div className="ew-card">
          <img className="ew-card-img" src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80" alt="Smart Devices" />
          <h5 className="ew-card-title">Smart Devices</h5>
        </div>

        <div className="ew-card">
          <img className="ew-card-img" src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80" alt="Computers" />
          <h5 className="ew-card-title">Computers</h5>
        </div>

        <div className="ew-card">
          <img className="ew-card-img" src="https://thumbs.dreamstime.com/z/bangkok-thailand-november-many-old-compact-digital-cameras-used-s-electronic-waste-environmental-problems-165572904.jpg" alt="Cameras" />
          <h5 className="ew-card-title">Cameras</h5>
        </div>
      </div>

      {/* ---------- ABOUT SECTION (SCROLL TARGET) ---------- */}
      <AboutSection />

      {/* ---------- WORKFLOW STEPS ---------- */}
      <Steps />

      

    </div>
  );
}
