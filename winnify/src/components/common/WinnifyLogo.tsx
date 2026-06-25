import { cn } from '@/lib/utils';
import logo from '@/assets/winnify-logo.png';

interface WinnifyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function WinnifyLogo({ className, size = 'md' }: WinnifyLogoProps) {
  const sizeMap = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
  };

  return (
    <img
      src={logo}
      alt="Winnify"
      className={cn('object-contain select-none', sizeMap[size], className)}
    />
  );
}
