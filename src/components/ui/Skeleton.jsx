import React from 'react';

const Skeleton = ({ width, height, className = '', rounded = false }) => {
  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div
      className={`skeleton-shimmer ${rounded ? 'rounded-full' : 'rounded-xl'} ${className}`}
      style={style}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <Skeleton height="224px" className="rounded-none" />
    <div className="p-5 space-y-3">
      <Skeleton height="20px" width="60%" />
      <Skeleton height="14px" width="40%" />
      <Skeleton height="14px" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton height="24px" width="80px" />
        <Skeleton height="36px" width="80px" rounded={false} className="rounded-lg" />
      </div>
    </div>
  </div>
);

export default Skeleton;
