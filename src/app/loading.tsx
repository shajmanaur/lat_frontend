'use client';

import React from 'react';
import styles from './loading.module.css';
import { FaGlobe } from 'react-icons/fa';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        <div className={styles.innerSpinner}></div>
        <FaGlobe className={styles.logoIcon} />
      </div>
      <div className={styles.text}>Loading LAT Admin...</div>
    </div>
  );
}
