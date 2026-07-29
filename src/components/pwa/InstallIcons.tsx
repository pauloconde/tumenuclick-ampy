interface IconProps {
    className?: string;
}

export const IconIOS = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M17,13H13V17H11V13H7V11H11V7H13V11H17V13Z" />
    </svg>
);

export const IconMobile = ({ className }: IconProps) => (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor">
        <path d="M426.537,0H179.641c-22.243,0-40.376,18.175-40.376,40.401v129.603h25.221V69.106h277.206V424.46H164.485
		v-83.887h-25.221v131.034c0,22.192,18.133,40.392,40.376,40.392h246.896c22.192,0,40.375-18.2,40.375-40.392v-129.03V40.401
		C466.912,18.175,448.728,0,426.537,0z M303.08,478.495c-9.174,0-16.636-7.47-16.636-16.661c0-9.183,7.462-16.653,16.636-16.653
		c9.158,0,16.686,7.47,16.686,16.653C319.766,471.025,312.247,478.495,303.08,478.495z"/>
        <polygon points="225.739,335.774 358.778,255.289 225.739,174.804 225.739,221.11 45.088,221.11 45.088,289.468 
		225.739,289.468"/>
    </svg>
);

export const IconDesktop = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M20,17H4V5H12V3H4C2.89,3 2,3.89 2,5V17C2,18.1 2.9,19 4,19H8V21H16V19H20C21.1,19 22,18.1 22,17V5C22,3.89 21.1,3 20,3H14V5H20V17M17,9L12,14L7,9H10V3H14V9H17Z" />
    </svg>
);
