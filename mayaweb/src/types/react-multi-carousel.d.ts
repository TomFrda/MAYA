declare module 'react-multi-carousel' {
  import { ComponentType } from 'react';

  interface ResponsiveType {
    superLargeDesktop: { breakpoint: { max: number; min: number }; items: number };
    desktop: { breakpoint: { max: number; min: number }; items: number };
    tablet: { breakpoint: { max: number; min: number }; items: number };
    mobile: { breakpoint: { max: number; min: number }; items: number };
  }

  interface CarouselProps {
    responsive: ResponsiveType;
    ssr?: boolean;
    infinite?: boolean;
    autoPlay?: boolean;
    showDots?: boolean;
    removeArrowOnDeviceType?: string[];
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  const Carousel: ComponentType<CarouselProps>;
  export default Carousel;
}
