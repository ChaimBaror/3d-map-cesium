import { useEffect, useRef, type FC } from 'react';
import { useCesium } from 'resium';
import Compass, { CompassOptions } from './Compass';

interface CompassComponentProps extends CompassOptions {}

const CompassComponent: FC<CompassComponentProps> = (options) => {
  const { viewer } = useCesium();
  const compassRef = useRef<Compass | null>(null);

  useEffect(() => {
    if (!viewer) return;

    // Create compass instance
    compassRef.current = new Compass(viewer, options);

    // Cleanup on unmount
    return () => {
      if (compassRef.current) {
        compassRef.current.destroy();
        compassRef.current = null;
      }
    };
  }, [viewer]);

  // Update options if they change
  useEffect(() => {
    if (compassRef.current && options) {
      // Options are passed in constructor, so we'd need to recreate if they change
      // For now, we'll just keep the initial options
    }
  }, [options]);

  return null; // Compass renders itself to the DOM
};

export default CompassComponent;

