import { FaUserPlus, FaSignInAlt, FaRecycle, FaArrowRight } from "react-icons/fa";
import "./Steps.css";

export default function StepsSection() {
  const steps = [
    {
      icon: <FaUserPlus />,
      keyword: "Register",
      description: "Create your account to start recycling responsibly.",
    },
    {
      icon: <FaSignInAlt />,
      keyword: "Login",
      description: "Access your dashboard and manage your e-waste activities.",
    },
    {
      icon: <FaRecycle />,
      keyword: "Recycle",
      description: "Request pickup, track recycling, and help protect the planet.",
    },
  ];

  return (
    <section className="steps-section">
      <h2 className="steps-heading">How It Works</h2>
      <div className="underline"></div>

      <div className="steps-wrapper">
        {steps.map((step, index) => (
          <div className="step-item" key={index}>
            {/* CARD */}
            <div className="octagon-card">
              <div className="mask-content">
                <div className="mask-icon">{step.icon}</div>
                <p className="mask-title">{step.keyword}</p>
              </div>
              <div className="description">
                <p>{step.description}</p>
              </div>
            </div>

            {/* ARROW BETWEEN CARDS */}
            {index < steps.length - 1 && (
              <FaArrowRight className="arrow" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
