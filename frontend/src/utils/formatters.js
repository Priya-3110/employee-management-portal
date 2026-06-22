import { API_ORIGIN } from '../services/api.js';

export const formatDate = (value) => {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'EP';

export const parseSkillText = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((skill) => String(skill).trim()).filter(Boolean);

  return String(value)
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export const formatSkills = (skills) => parseSkillText(skills).join(', ');
