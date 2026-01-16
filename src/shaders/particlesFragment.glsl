uniform vec3 uColor;
uniform float uTime;

varying float vSpeed;
varying float vDist;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    float strength = clamp(1.0 - (dist * 2.0), 0.0, 1.0);
    
    // Liquid Light Falloff
    strength = pow(strength, 1.3);
    
    if (strength < 0.01) discard;

    // Spectral Shift: Color changes based on speed and distance
    // Blue-ish at rest, Red-ish at high speed, with distance-based hue shift
    vec3 color = uColor;
    color = mix(color, vec3(0.0, 1.0, 1.0), clamp(vSpeed * 0.5, 0.0, 1.0)); // Cyan shift on speed
    color.r += sin(vDist * 0.1 + uTime) * 0.2; // Distance-based red pulse
    
    // Core glow
    vec3 finalColor = mix(color, vec3(1.0), strength * 0.8);
    
    // Subtle scanline + flicker (refined)
    float scanline = sin(gl_FragCoord.y * 0.1 - uTime * 2.0) * 0.02;
    strength = clamp(strength + scanline, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, strength);
}
