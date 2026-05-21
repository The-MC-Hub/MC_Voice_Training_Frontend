import React, { useState } from 'react';
import { User } from 'lucide-react';
import Skeleton from './Skeleton';

const LazyImage = ({ src, alt, className = '', placeholder = null }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`lazy-image-wrapper ${className}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {!loaded && !error && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <User size={40} className="text-slate-600" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => { setLoaded(true); setError(true); }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
};

export default LazyImage;
