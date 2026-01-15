"use client";

export default function MaintenancePage() {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        {/* Main Icon */}
        <div className="maintenance-icon">🚧</div>

        {/* Title */}
        <h1 className="maintenance-title">Site Under Maintenance</h1>

        {/* Message */}
        <p className="maintenance-message">
          We'll be back shortly!
        </p>

        {/* Decorative line */}
        <div className="maintenance-divider" />

        {/* Additional info */}
        <p className="maintenance-subtext">
          We're performing scheduled maintenance to improve your experience.
          <br />
          Thank you for your patience.
        </p>

        {/* Bottom Icon */}
        <div className="maintenance-icon">🚧</div>
      </div>

      <style jsx>{`
        .maintenance-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 2rem;
        }

        .maintenance-content {
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 4rem 3rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .maintenance-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .maintenance-icon:last-child {
          margin-top: 1.5rem;
          margin-bottom: 0;
        }

        .maintenance-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 1rem 0;
          letter-spacing: -0.02em;
        }

        .maintenance-message {
          font-size: 1.5rem;
          color: #e0e0e0;
          margin: 0 0 1.5rem 0;
          font-weight: 500;
        }

        .maintenance-divider {
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
          margin: 0 auto 1.5rem auto;
        }

        .maintenance-subtext {
          font-size: 1rem;
          color: #a0a0a0;
          line-height: 1.6;
          margin: 0;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @media (max-width: 480px) {
          .maintenance-content {
            padding: 3rem 2rem;
          }

          .maintenance-title {
            font-size: 1.75rem;
          }

          .maintenance-message {
            font-size: 1.25rem;
          }

          .maintenance-icon {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
