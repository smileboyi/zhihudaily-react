import React, { memo } from 'react';

const Loading: React.SFC = memo(() => {
  return (
    <span className="centre2" style={{ fontSize: '1.5rem' }}>
      加载中
      <i className="dot"></i>
    </span>
  );
});

export default Loading;
