'use client';

import React from 'react';
import { Headphones, Mail, Phone, MessageCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#1E293B' }}>Help & Support</h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '4px' }}>
          Get help with using the LAT platform.
        </p>
      </div>

      {/* Support Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Mail size={24} color="#6366F1" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>Email Support</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '12px' }}>Send us an email for detailed assistance</p>
          <a href="mailto:support@lat.edu.in" style={{ color: '#6366F1', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
            support@lat.edu.in
          </a>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Phone size={24} color="#10B981" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>Phone Support</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '12px' }}>Call us during business hours</p>
          <a href="tel:+911800123456" style={{ color: '#6366F1', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
            1800-123-456 (Toll Free)
          </a>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageCircle size={24} color="#F59E0B" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '8px' }}>Live Chat</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '12px' }}>Chat with our support team</p>
          <button style={{ color: '#6366F1', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
            Start Chat
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Frequently Asked Questions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { q: 'How do I enter OMR responses?', a: 'Navigate to Digital OMR Entry from the sidebar, select a student, and fill in the responses for each question.' },
            { q: 'How do I view my allocations?', a: 'Click on My Allocations in the sidebar to see all grade and section assignments.' },
            { q: 'What do I do if a student is absent?', a: 'Mark the student as Absent in the OMR entry form. No OMR responses will be recorded for absent students.' },
          ].map((faq, i) => (
            <div key={i} style={{ padding: '16px', background: '#FAFBFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
              <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.875rem', marginBottom: '6px' }}>{faq.q}</div>
              <div style={{ color: '#64748B', fontSize: '0.8125rem', lineHeight: 1.5 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
