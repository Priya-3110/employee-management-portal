import { getImageUrl, getInitials } from '../utils/formatters.js';

const Avatar = ({ name, image, size = 'md' }) => {
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-20 w-20 text-xl',
  };

  const className = `${sizes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-700`;

  if (image) {
    return <img src={getImageUrl(image)} alt={name} className={`${className} object-cover`} />;
  }

  return <div className={className}>{getInitials(name)}</div>;
};

export default Avatar;
