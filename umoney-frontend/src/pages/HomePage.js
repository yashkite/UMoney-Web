import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Menubar } from 'primereact/menubar';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Badge } from 'primereact/badge';
import UMoneyLogo from '../components/UMoneyLogo';

function HomePage() {
  const [showRuleDialog, setShowRuleDialog] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleEmailLogin = () => {
    // For future implementation
    window.location.href = '/login';
  };

  return (
    <div className="home-container">
      {/* Background with gradient and pattern */}
      <div className="background-pattern"></div>

      {/* Navigation Menu */}
      <Menubar
        start={<UMoneyLogo size="medium" />}
        end={<div>
          <Link to="/login" className="no-underline">
            <Button label="Login" className="p-button-text mr-2" />
          </Link>
        </div>}
        className="surface-card shadow-2 mb-4 border-none"
        style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}
      />

      {/* Main Content Area */}
      <div className="grid">
        <div className="col-12 md:col-6 flex align-items-center justify-content-center">
          <div className="text-center md:text-left px-4 py-8 md:pl-6 md:pr-0 animated-content">
            <h1 className="text-6xl font-bold mb-2 text-gradient">Welcome to UMoney</h1>
            <h2 className="text-2xl font-normal text-700 mb-3">Smart financial management made simple</h2>

            <div className="mb-4 p-2 border-left-3 border-primary bg-primary-50 text-primary-900">
              <p className="text-xl line-height-3 m-0">
                Take control of your finances with the 50/30/20 rule.
                Track your spending, manage your budget, and reach your savings goals.
              </p>
            </div>

            <div className="flex flex-column md:flex-row gap-3 mb-5">
              <Button
                label="Get Started with Google"
                icon="pi pi-google"
                onClick={handleGoogleLogin}
                size="large"
                severity="primary"
                raised
                className="login-button p-button-rounded"
              />
              <Button
                label="Sign up with Email"
                icon="pi pi-envelope"
                onClick={handleEmailLogin}
                size="large"
                outlined
                className="p-button-rounded"
              />
            </div>

            <div className="flex align-items-center justify-content-center md:justify-content-start mb-4">
              <Button
                label="Learn about the 50/30/20 rule"
                className="p-button-text p-button-plain"
                icon="pi pi-info-circle"
                onClick={() => setShowRuleDialog(true)}
              />
            </div>

            <div className="flex align-items-center justify-content-center md:justify-content-start gap-3">
              <Badge value="Secure" severity="success" className="p-2"></Badge>
              <Badge value="Trusted by 10,000+ users" severity="info" className="p-2"></Badge>
            </div>
          </div>
        </div>

        <div className="col-12 md:col-6 hidden md:flex align-items-center justify-content-center">
          <div className="finance-illustration">
            {/* SVG illustration would go here - using a placeholder div for now */}
            <div className="illustration-placeholder">
              <i className="pi pi-chart-pie" style={{ fontSize: '8rem', opacity: 0.7 }}></i>
              <i className="pi pi-chart-line" style={{ fontSize: '6rem', opacity: 0.5, position: 'absolute', right: '20%', top: '20%' }}></i>
              <i className="pi pi-wallet" style={{ fontSize: '5rem', opacity: 0.6, position: 'absolute', left: '10%', bottom: '15%' }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="surface-card p-4 shadow-2 border-round mt-4">
        <div className="text-center mb-3">
          <h3 className="text-xl font-semibold">What Our Users Say</h3>
        </div>
        <div className="grid">
          <div className="col-12 md:col-4 p-3">
            <div className="p-3 border-round bg-primary-50 h-full">
              <div className="text-primary mb-2">
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill"></i>
              </div>
              <p className="line-height-3 text-700">"UMoney helped me understand where my money was going and save more effectively. The 50/30/20 rule changed my financial life!"</p>
              <p className="text-900 font-semibold">- Sarah J.</p>
            </div>
          </div>
          <div className="col-12 md:col-4 p-3">
            <div className="p-3 border-round bg-primary-50 h-full">
              <div className="text-primary mb-2">
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill"></i>
              </div>
              <p className="line-height-3 text-700">"The automatic distribution of my income into needs, wants, and savings categories has made budgeting effortless."</p>
              <p className="text-900 font-semibold">- Michael T.</p>
            </div>
          </div>
          <div className="col-12 md:col-4 p-3">
            <div className="p-3 border-round bg-primary-50 h-full">
              <div className="text-primary mb-2">
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill mr-1"></i>
                <i className="pi pi-star-fill"></i>
              </div>
              <p className="line-height-3 text-700">"I've tried many finance apps, but UMoney's simplicity and effectiveness stands out. I'm finally saving consistently!"</p>
              <p className="text-900 font-semibold">- Alex R.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-4 text-500">
        <p>© 2023 UMoney. All rights reserved.</p>
        <p className="text-xs">Your data is encrypted and secure. We never share your financial information.</p>
      </div>

      {/* 50/30/20 Rule Dialog */}
      <Dialog
        header="The 50/30/20 Rule Explained"
        visible={showRuleDialog}
        style={{ width: '90%', maxWidth: '600px' }}
        onHide={() => setShowRuleDialog(false)}
        draggable={false}
        resizable={false}
      >
        <div className="p-3">
          <h3>What is the 50/30/20 Rule?</h3>
          <p className="line-height-3">
            The 50/30/20 rule is a simple budgeting method that helps you manage your money effectively, prioritize saving, and spend mindfully.
          </p>

          <Divider />

          <div className="grid">
            <div className="col-12 md:col-4">
              <div className="p-3 border-round bg-blue-50">
                <h4 className="text-blue-700 m-0 mb-2">50% - Needs</h4>
                <p className="m-0 text-700">Essential expenses like rent, utilities, groceries, and minimum debt payments.</p>
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="p-3 border-round bg-purple-50">
                <h4 className="text-purple-700 m-0 mb-2">30% - Wants</h4>
                <p className="m-0 text-700">Non-essential expenses like dining out, entertainment, shopping, and hobbies.</p>
              </div>
            </div>
            <div className="col-12 md:col-4">
              <div className="p-3 border-round bg-green-50">
                <h4 className="text-green-700 m-0 mb-2">20% - Savings</h4>
                <p className="m-0 text-700">Savings, investments, emergency fund, and additional debt payments.</p>
              </div>
            </div>
          </div>

          <Divider />

          <h3>How UMoney Helps</h3>
          <p className="line-height-3">
            UMoney automatically distributes your income according to this rule, making it easy to stick to your budget.
            You can also customize the percentages to fit your unique financial situation.
          </p>

          <div className="flex justify-content-end mt-4">
            <Button label="Get Started Now" icon="pi pi-check" onClick={() => {
              setShowRuleDialog(false);
              handleGoogleLogin();
            }} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default HomePage;
