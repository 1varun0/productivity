import type { OnlineMember } from '../types';

interface PresenceBarProps {
  members: OnlineMember[];
}

export function PresenceBar({ members }: PresenceBarProps) {
  if (members.length === 0) return null;

  const displayed = members.slice(0, 4);
  const overflow = members.length - 4;
  const isJustYou = members.length === 1;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center" style={{ marginLeft: '-2px' }}>
        {displayed.map((member, i) => (
          <div
            key={member.user_id}
            className="relative flex items-center justify-center rounded-full shrink-0"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #131313',
              marginLeft: i > 0 ? '-8px' : '0',
              zIndex: displayed.length - i,
              fontSize: '10px',
              color: '#e5e2e1',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {(member.name || 'U').charAt(0).toUpperCase()}
            {/* Green online dot */}
            <div
              className="absolute rounded-full"
              style={{
                bottom: '0px',
                right: '0px',
                width: '8px',
                height: '8px',
                backgroundColor: '#84d6b9',
                border: '1.5px solid #131313',
              }}
            />
          </div>
        ))}

        {overflow > 0 && (
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #131313',
              marginLeft: '-8px',
              fontSize: '10px',
              color: '#928f9e',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            +{overflow}
          </div>
        )}
      </div>

      {isJustYou && (
        <span
          style={{
            fontSize: '10px',
            color: '#555',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Just you
        </span>
      )}
    </div>
  );
}
