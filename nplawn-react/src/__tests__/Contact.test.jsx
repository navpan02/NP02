import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import Contact from '../pages/Contact';

function renderContact() {
  return render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>
  );
}

function fillForm({ name = 'Jane Smith', email = 'jane@example.com', message = 'I need lawn help.' } = {}) {
  fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText('jane@example.com'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText(/tell us about your lawn/i), { target: { value: message } });
}

describe('Contact Page – Lead Submission', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the contact form with all key fields', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('(630) 555-0100')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // service dropdown
    expect(screen.getByPlaceholderText(/tell us about your lawn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('renders all available service options in the dropdown', () => {
    renderContact();
    const select = screen.getByRole('combobox');
    const options = Array.from(select.querySelectorAll('option')).map(o => o.textContent);
    expect(options).toContain('Lawn Mowing');
    expect(options).toContain('Tree Trimming');
    expect(options).toContain('Aeration & Seeding');
    expect(options).toContain('Landscape Design');
  });

  it('saves the lead to localStorage after form submission', () => {
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads).toHaveLength(1);
    expect(leads[0].name).toBe('Jane Smith');
    expect(leads[0].email).toBe('jane@example.com');
    expect(leads[0].message).toBe('I need lawn help.');
    expect(leads[0].submittedAt).toBeDefined();
  });

  it('includes selected service in the saved lead', () => {
    renderContact();
    fillForm();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Lawn Mowing' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads[0].service).toBe('Lawn Mowing');
  });

  it('appends to existing leads rather than overwriting them', () => {
    localStorage.setItem('nplawn_leads', JSON.stringify([{ name: 'Existing Lead', email: 'old@example.com' }]));
    renderContact();
    fillForm({ name: 'New Lead', email: 'new@example.com' });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    const leads = JSON.parse(localStorage.getItem('nplawn_leads'));
    expect(leads).toHaveLength(2);
    expect(leads[0].name).toBe('Existing Lead');
    expect(leads[1].name).toBe('New Lead');
  });

  it('shows the success screen after submission', () => {
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText('Message Received!')).toBeInTheDocument();
    expect(screen.getByText(/we'll be in touch within one business day/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send message/i })).not.toBeInTheDocument();
  });

  it('marks required fields with the required attribute', () => {
    renderContact();
    expect(screen.getByPlaceholderText('Jane Smith')).toBeRequired();
    expect(screen.getByPlaceholderText('jane@example.com')).toBeRequired();
    expect(screen.getByPlaceholderText(/tell us about your lawn/i)).toBeRequired();
    // Phone is optional
    expect(screen.getByPlaceholderText('(630) 555-0100')).not.toBeRequired();
  });
});
