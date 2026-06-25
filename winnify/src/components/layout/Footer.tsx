import { Link } from 'react-router-dom';
import WinnifyLogo from '@/components/common/WinnifyLogo';

const footerLinks = {
  Products: [
    { label: 'Courses', to: '#' },
    { label: 'Skill Paths', to: '#' },
    { label: 'Projects', to: '#' },
    { label: 'Assessments', to: '#' },
    { label: 'Mock Interviews', to: '#' },
  ],
  Topics: [
    { label: 'System Design', to: '#' },
    { label: 'Interview Prep', to: '#' },
    { label: 'Generative AI', to: '#' },
    { label: 'Machine Learning', to: '#' },
    { label: 'Web Development', to: '#' },
  ],
  Resources: [
    { label: 'Blog', to: '#' },
    { label: 'Cheatsheets', to: '#' },
    { label: 'Guides', to: '#' },
    { label: 'FAQ', to: '#' },
  ],
  Company: [
    { label: 'About Us', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Contact', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center mb-3">
              <WinnifyLogo size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered interactive learning platform for developers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold font-[family-name:var(--font-heading)] mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Winnify, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
