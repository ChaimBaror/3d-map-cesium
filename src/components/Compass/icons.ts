const compass_outer = `
<svg width="145" height="145" viewBox="0 0 145 145" xmlns="http://www.w3.org/2000/svg">
  <circle cx="72.5" cy="72.5" r="70" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"/>
  <circle cx="72.5" cy="72.5" r="50" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
  <path d="M 72.5 2.5 L 75 20 L 72.5 22.5 L 70 20 Z" fill="rgba(255,255,255,0.9)"/>
  <text x="72.5" y="15" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="bold">N</text>
  <path d="M 142.5 72.5 L 125 70 L 122.5 72.5 L 125 75 Z" fill="rgba(255,255,255,0.9)"/>
  <text x="135" y="78" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="bold">E</text>
  <path d="M 72.5 142.5 L 70 125 L 72.5 122.5 L 75 125 Z" fill="rgba(255,255,255,0.9)"/>
  <text x="72.5" y="135" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="bold">S</text>
  <path d="M 2.5 72.5 L 20 75 L 22.5 72.5 L 20 70 Z" fill="rgba(255,255,255,0.9)"/>
  <text x="10" y="78" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="bold">W</text>
</svg>
`;

const compass_inner = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="rgba(40,40,40,0.7)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  <circle cx="50" cy="50" r="40" fill="rgba(60,60,60,0.5)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <line x1="50" y1="10" x2="50" y2="30" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
  <line x1="50" y1="70" x2="50" y2="90" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
  <line x1="10" y1="50" x2="30" y2="50" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
  <line x1="70" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
</svg>
`;

const compass_rotation_marker = `
<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="10" cy="10" r="8" fill="rgba(255,200,0,0.8)" stroke="rgba(255,255,255,0.9)" stroke-width="1"/>
  <line x1="10" y1="2" x2="10" y2="10" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

const Icons = {
  compass_outer,
  compass_inner,
  compass_rotation_marker,
};

export default Icons;

