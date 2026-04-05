import React from 'react';
import { LOGO_PATH } from '../constants/branding';
import './Logo.css';

/**
 * Product mark — uses the team logo from /public/briefly-logo.png.
 */
function Logo({ className = '', height = 40, width, alt = 'Briefly', ...rest }) {
  return (
    <img
      src={LOGO_PATH}
      alt={alt}
      className={`logo-img ${className}`.trim()}
      height={height}
      width={width}
      style={width ? undefined : { height, width: 'auto' }}
      {...rest}
    />
  );
}

export default Logo;
