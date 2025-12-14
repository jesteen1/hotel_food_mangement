import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: '#ea580c', // orange-600
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '4px',
                }}
            >
                {/* Hotel Icon SVG */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M10 22v-6.57" />
                    <path d="M12 11h.01" />
                    <path d="M12 7h.01" />
                    <path d="M14 15.43V22" />
                    <path d="M15 16a5 5 0 0 0-6 0" />
                    <path d="M16 11h.01" />
                    <path d="M16 7h.01" />
                    <path d="M8 11h.01" />
                    <path d="M8 7h.01" />
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    )
}
