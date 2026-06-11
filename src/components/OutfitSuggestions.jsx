import React from 'react';
import { FaTshirt, FaRunning, FaExclamationTriangle } from 'react-icons/fa';
import { getSuggestions } from '../utils/activityOutfitSuggester';
import styles from './OutfitSuggestions.module.css';

export default function OutfitSuggestions({ current }) {
  if (!current) return null;

  const { outfit, activities, warning } = getSuggestions(current);

  return (
    <div className={`${styles.container} glass-card fade-in`} id="outfit-suggestions-container">
      <h2 className={styles.title}>Smart Gear & Activities</h2>
      
      <div className={styles.grid}>
        {warning && (
          <div className={styles.alertBox} id="suggestions-warning-box">
            <FaExclamationTriangle size={16} />
            <span>{warning}</span>
          </div>
        )}

        <div className={styles.section} id="outfit-recommendations">
          <h3 className={styles.subTitle}>
            <FaTshirt size={16} /> Recommended Outfit
          </h3>
          <ul className={styles.list}>
            {outfit.map((item, idx) => (
              <li key={idx} className={styles.item}>
                <span className={styles.bullet}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section} id="activity-recommendations">
          <h3 className={styles.subTitle}>
            <FaRunning size={16} /> Activity Suggestions
          </h3>
          <ul className={styles.list}>
            {activities.map((item, idx) => (
              <li key={idx} className={styles.item}>
                <span className={styles.bullet}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
