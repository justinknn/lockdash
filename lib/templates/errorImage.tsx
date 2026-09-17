interface ErrorScreenProps {
  message: string;
  width: number;
  height: number;
}

/**
 * Rendered instead of a normal dashboard when the request's config is
 * invalid. A Shortcut that sets this as wallpaper would otherwise just show
 * a blank/failed image with no clue why — this makes the problem visible
 * directly on the lock screen.
 */
export function ErrorScreen({ message, width, height }: ErrorScreenProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        backgroundColor: '#1a0e12',
        padding: 48,
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <div style={{ display: 'flex', color: '#ff6b6b', fontSize: 44, fontWeight: 700 }}>
        Lockdash config error
      </div>
      <div style={{ display: 'flex', color: '#f5c6c6', fontSize: 28 }}>{message}</div>
      <div style={{ display: 'flex', color: '#8a6b6f', fontSize: 22 }}>
        Check the config sent to /api/render.
      </div>
    </div>
  );
}
