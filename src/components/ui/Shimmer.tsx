import React from 'react';

export const ShimmerTable = ({ rows = 5, columns = 5 }: { rows?: number, columns?: number }) => {
  return (
    <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {[...Array(columns)].map((_, i) => (
              <th key={i} style={{ padding: '16px 24px', textAlign: 'left' }}>
                <div className="animate-shimmer" style={{ height: '14px', width: '60%', borderRadius: '4px' }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex} style={{ borderBottom: '1px solid #F1F5F9' }}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex} style={{ padding: '16px 24px' }}>
                  <div className="animate-shimmer" style={{ height: '14px', width: colIndex === 0 ? '40%' : '80%', borderRadius: '4px' }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ShimmerCard = ({ height }: { height?: string }) => {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px', height: height || 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="animate-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
        <div className="animate-shimmer" style={{ width: '24px', height: '24px', borderRadius: '4px' }}></div>
      </div>
      <div>
        <div className="animate-shimmer" style={{ height: '28px', width: '60%', borderRadius: '6px', marginBottom: '8px' }}></div>
        <div className="animate-shimmer" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
};

export const ShimmerList = ({ items = 3 }: { items?: number }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[...Array(items)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
          <div className="animate-shimmer" style={{ width: '48px', height: '48px', borderRadius: '8px', flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="animate-shimmer" style={{ height: '16px', width: '40%', borderRadius: '4px' }}></div>
            <div className="animate-shimmer" style={{ height: '12px', width: '20%', borderRadius: '4px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
