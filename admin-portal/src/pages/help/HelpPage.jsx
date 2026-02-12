import { useState } from 'react';

const HelpPage = () => {
  const faqs = [
    {
      question: "How do I add a new hospital?",
      answer: "Navigate to the 'Hospitals' section in the sidebar and click the 'Add Hospital' button. Fill in the required details including location and contact information."
    },
    {
      question: "How do I update resource availability?",
      answer: "Go to the 'Dashboard' or 'Resources' page. You can quickly update availability using the edit actions or by clicking on a specific resource."
    },
    {
      question: "Who can see system logs?",
      answer: "System logs are restricted to Super Admins only. They track all critical actions performed within the admin portal."
    },
    {
      question: "How do I reset a staff member's password?",
      answer: "Currently, password resets must be handled by the Super Admin via the database or by contacting support. A self-service reset feature is coming soon."
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="page-title">Help & Support</h1>
        <p className="page-subtitle">Frequently asked questions and support guides</p>
      </div>

      <div className="grid gap-6">
        {faqs.map((faq, index) => (
          <div key={index} className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-primary-50 border-primary-100">
        <div className="card-body">
          <h2 className="text-lg font-bold text-primary-900 mb-2">Need more help?</h2>
          <p className="text-primary-700 mb-4">
            If you can't find what you're looking for, please contact the system administrator.
          </p>
          <div className="flex gap-4">
            <a href="mailto:support@careconnect.com" className="btn btn-primary">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
