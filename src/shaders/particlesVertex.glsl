uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform float uSize;
uniform float uTime;

varying float vSpeed;
varying float vDist;

void main() {
    vec3 pos = texture2D(uPositions, position.xy).xyz;
    vec3 vel = texture2D(uVelocities, position.xy).xyz;
    
    float speed = length(vel);
    vSpeed = speed;

    // Holographic Jitter
    float jitter = sin(uTime * 10.0 + pos.x * 100.0) * 0.005 * speed;
    pos += jitter;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vDist = length(mvPosition.xyz);

    // Motion Stretch Visual
    float stretch = 1.0 + clamp(speed * 4.0, 0.0, 8.0);
    
    float size = uSize * stretch * (1.0 / -mvPosition.z);
    gl_PointSize = max(size, 2.5);
}
