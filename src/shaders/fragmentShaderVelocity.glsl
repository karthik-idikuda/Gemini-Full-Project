
uniform float uTime;
uniform float uDelta;
uniform sampler2D uTargetPositions; // The target shape positions
uniform int uTargetShape; // 0: Sphere, 1: Heart, etc. (actually handled by blending textures or just switching uTargetPositions if possible, but simpler to have one target texture updated via JS)
uniform vec3 uMouse;
uniform float uInteractionRadius;
uniform float uInteractionStrength;

// Simplex 3D Noise 
// (Adapted from standard webgl-noise)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    float n1 = snoise(p + vec3(e, 0, 0));
    float n2 = snoise(p - vec3(e, 0, 0));
    float n3 = snoise(p + vec3(0, e, 0));
    float n4 = snoise(p - vec3(0, e, 0));
    float n5 = snoise(p + vec3(0, 0, e));
    float n6 = snoise(p - vec3(0, 0, e));

    float x = n3 - n4 - n5 + n6;
    float y = n5 - n6 - n1 + n2;
    float z = n1 - n2 - n3 + n4;

    return normalize(vec3(x, y, z));
}

// Rotation matrix helper
mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle),
                sin(angle),  cos(angle));
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D( texturePosition, uv ).xyz;
    vec3 vel = texture2D( textureVelocity, uv ).xyz;
    vec3 target = texture2D( uTargetPositions, uv ).xyz;

    // --- Curl Noise Turbulence ---
    // Add swirl to velocity
    vec3 noise = curlNoise(pos * 0.3 + uTime * 0.05);
    vel += noise * 0.15 * uDelta; // Subtle, smooth turbulence

    // ----------------------------


    // --- Dynamic Target Animation ---
    if (uTargetShape == 4) { // Helix
        // Rotate around Y axis
        float angle = uTime * 0.5;
        target.xz = rotate2d(angle) * target.xz;
    } 
    else if (uTargetShape == 5) { // Wave
        // Ripple y based on x/z and time
        float dist = length(target.xz);
        target.y += sin(dist * 2.0 - uTime * 2.0) * 1.0;
        // Also subtle roll?
    }
    else if (uTargetShape == 6) { // Spiral
        // Rotate entire spiral
        float angle = uTime * 0.2;
        target.xz = rotate2d(angle) * target.xz;
    }
    else if (uTargetShape == 7) { // Galaxy
        // Spiral rotation
        float r = length(target.xz);
        float angle = uTime * 0.3 * (1.0 / (r + 1.0)); // Distant stars move slower
        target.xz = rotate2d(angle) * target.xz;
    }
    else if (uTargetShape == 8) { // BlackHole
        // Keplerian rotation + warping
        float r = length(target.xz);
        float angle = (uTime * 4.0) / (r * 0.5 + 0.5); 
        target.xz = rotate2d(angle) * target.xz;
        
        // Dynamic pull based on time
        float pull = sin(uTime * 2.0) * 0.2;
        target.y += pull * (1.0 / (r + 0.1));
    }
    else if (uTargetShape == 9) { // Tesseract
        // Advanced 4D Rotation!
        float w = texture2D(uTargetPositions, uv).a; 
        
        float t1 = uTime * 0.4;
        float t2 = uTime * 0.2;
        
        // Rotate in XW and ZW planes
        float x = target.x;
        float z = target.z;
        
        target.x = x * cos(t1) - w * sin(t1);
        target.z = z * cos(t2) - w * sin(t2);
        
        // Perspective projection from 4D (w) to 3D?
        // Let's use w to scale the points slightly for a "shifting depth" feel
        target *= (1.0 + w * 0.1);
    }
    // --------------------------------

    // Attraction to target
    vec3 direction = target - pos;
    float dist = length(direction);
    vec3 force = direction * 1.5; // Softer spring for smoother easing

    // Mouse Interaction
    float mouseDist = distance(pos, uMouse);
    if (mouseDist < uInteractionRadius) {
        vec3 mouseDir = normalize(pos - uMouse);
        // Repulsion / Attraction
        // Add random noise to force for "energy" feel
        force += mouseDir * uInteractionStrength / (mouseDist + 0.05);
    }

    // Damping
    vel *= 0.92; // Elegant damping for smooth HD motion
    
    // Apply force
    vel += force * uDelta;

    gl_FragColor = vec4( vel, 1.0 );
}
