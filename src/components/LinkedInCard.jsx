import React from 'react';
import { ExternalLink, X, Briefcase, MapPin, Sparkles } from 'lucide-react';
import styles from './LinkedInCard.module.css';

const LinkedinIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function LinkedInCard({ profile, onDismiss }) {
  if (!profile) return null;

  // Extract initials for the profile avatar
  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'LN';

  return (
    <div className={`${styles.linkedinCard} glass-card fade-in`} id="linkedin-profile-card">
      <button 
        className={styles.closeBtn} 
        onClick={onDismiss} 
        title="Dismiss LinkedIn profile"
        aria-label="Dismiss LinkedIn profile"
      >
        <X size={16} />
      </button>

      <div className={styles.header}>
        <div className={styles.badge}>
          <LinkedinIcon className={styles.linkedinIcon} size={16} fill="currentColor" />
          <span>LinkedIn Connected</span>
        </div>
        <a 
          href={profile.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.externalLink}
          title="View Original LinkedIn Profile"
        >
          <span>View Profile</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className={styles.profileBody}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarGradient}>
            {initials}
          </div>
          <div className={styles.activePulse} />
        </div>

        <div className={styles.profileDetails}>
          <h2 className={styles.profileName}>{profile.name}</h2>
          <p className={styles.profileHeadline}>{profile.headline}</p>
          
          <div className={styles.metaRow}>
            <Briefcase size={14} className={styles.metaIcon} />
            <span className={styles.metaText}>{profile.company}</span>
          </div>

          <div className={styles.metaRow}>
            <MapPin size={14} className={styles.metaIcon} />
            <span className={styles.metaText}>{profile.location}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Sparkles size={14} className={styles.sparkleIcon} />
        <span className={styles.footerText}>
          Location extracted from profile. Displaying current weather systems for <strong>{profile.location}</strong>.
        </span>
      </div>
    </div>
  );
}
